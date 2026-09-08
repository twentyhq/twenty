import { z } from 'zod';
import { getFunctionsBaseUrl } from '../../../twenty-front/src/modules/settings/logic-functions/utils/getLogicFunctionHttpUrl';
import { type SecureStore, type Credentials } from './secure-store';
import {
  refreshCredentials,
  requestJson,
  validateServerUrl,
  TwentyRequestError,
  DesktopRecorderUnavailableError,
} from './oauth';
import { recordingConfigurationSchema, type Agenda } from '../shared/types';
import { getImageAbsoluteURI } from '../../../twenty-shared/src/utils/image/getImageAbsoluteURI';

type ConnectionContext = {
  endpoint: string;
  workspaceUrl: string;
  workspace: Agenda['workspace'];
};

const resolveImageUrl = (
  imageUrl: string | null | undefined,
  baseUrl: string,
): string | null => {
  if (!imageUrl) return null;
  try {
    const url = new URL(getImageAbsoluteURI({ imageUrl, baseUrl }), baseUrl);
    validateServerUrl(url.origin);
    return !url.username && !url.password ? url.href : null;
  } catch {
    return null;
  }
};

export class TwentyClient {
  private credentials: Credentials | null = null;
  private context: ConnectionContext | null = null;
  get workspaceUrl() {
    return this.context?.workspaceUrl ?? null;
  }
  get workspace() {
    return this.context?.workspace ?? null;
  }
  private refreshing: Promise<void> | null = null;
  private credentialWrite: Promise<void> = Promise.resolve();
  private connectionVersion = 0;

  constructor(private store: SecureStore) {}

  resolveImageUrl(imageUrl?: string | null): string | null {
    return this.credentials
      ? resolveImageUrl(imageUrl, this.credentials.serverUrl)
      : null;
  }

  async restore(): Promise<Credentials | null> {
    const connectionVersion = this.connectionVersion;
    const credentials = await this.store.readCredentials();
    if (connectionVersion === this.connectionVersion)
      this.credentials = credentials;
    return this.credentials;
  }

  async connect(credentials: Credentials, signal?: AbortSignal): Promise<void> {
    const previousConnectionVersion = this.connectionVersion;
    const context = await this.discoverEndpoint(credentials, signal);
    try {
      const configuration = recordingConfigurationSchema.safeParse(
        await requestJson(context.endpoint, {
          signal,
          method: 'POST',
          headers: {
            Authorization: `Bearer ${credentials.accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ action: 'configuration' }),
        }),
      );
      if (!configuration.success)
        throw new Error(
          'Twenty returned an invalid recording configuration. Check Desktop Recorder settings and try again.',
        );
    } catch (error) {
      if (error instanceof TwentyRequestError && error.status === 404)
        throw new DesktopRecorderUnavailableError(credentials.serverUrl);
      throw error;
    }
    signal?.throwIfAborted();
    if (previousConnectionVersion !== this.connectionVersion)
      throw new Error('Your workspace connection changed. Try again.');
    const connectionVersion = ++this.connectionVersion;
    const previous = this.credentials;
    const previousContext = this.context;
    this.refreshing = null;
    this.credentials = null;
    this.context = null;
    try {
      await this.persistCredentials(async () => {
        signal?.throwIfAborted();
        await this.store.writeCredentials(credentials);
        if (signal?.aborted) {
          if (connectionVersion === this.connectionVersion) {
            if (previous) await this.store.writeCredentials(previous);
            else await this.store.clearCredentials();
          }
          signal.throwIfAborted();
        }
      });
      if (connectionVersion === this.connectionVersion) {
        this.credentials = credentials;
        this.context = context;
      }
    } catch (error) {
      if (connectionVersion === this.connectionVersion) {
        this.credentials = previous;
        this.context = previousContext;
      }
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    const credentials = this.credentials;
    this.connectionVersion++;
    this.refreshing = null;
    this.credentials = null;
    this.context = null;
    await this.persistCredentials(() => this.store.clearCredentials());
    if (credentials) {
      await fetch(`${credentials.serverUrl}/oauth/revoke`, {
        method: 'POST',
        body: new URLSearchParams({
          token: credentials.refreshToken,
          client_id: credentials.clientId,
        }),
        signal: AbortSignal.timeout(5000),
        redirect: 'error',
      }).catch(() => undefined);
    }
  }

  private persistCredentials(write: () => Promise<void>): Promise<void> {
    const pending = this.credentialWrite.then(write);
    this.credentialWrite = pending.catch(() => undefined);
    return pending;
  }

  async companion<TResponse>(
    body: object,
    responseSchema: z.ZodType<TResponse>,
  ): Promise<TResponse> {
    const connectionVersion = this.connectionVersion;
    if (!this.credentials)
      throw new Error('Connect your Twenty workspace first.');
    if (this.credentials.expiresAt < Date.now() + 60_000) {
      if (!this.refreshing) {
        const refreshing = this.refresh().finally(() => {
          if (this.refreshing === refreshing) this.refreshing = null;
        });
        this.refreshing = refreshing;
      }
      await this.refreshing;
    }
    if (!this.credentials || connectionVersion !== this.connectionVersion)
      throw new Error('Reconnect your Twenty workspace.');
    if (!this.context) {
      const context = await this.discoverEndpoint(this.credentials);
      if (connectionVersion === this.connectionVersion) this.context = context;
    }
    if (
      !this.context ||
      !this.credentials ||
      connectionVersion !== this.connectionVersion
    )
      throw new Error('Reconnect your Twenty workspace.');
    const serverUrl = this.credentials.serverUrl;
    try {
      const response = await requestJson(this.context.endpoint, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.credentials.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });
      if (connectionVersion !== this.connectionVersion)
        throw new Error('Your workspace connection changed. Try again.');
      const parsed = responseSchema.safeParse(response);
      if (!parsed.success)
        throw new Error(
          'Twenty returned an incomplete response. Refresh or ask your administrator to update the Desktop Recorder integration.',
        );
      return parsed.data;
    } catch (error) {
      if (error instanceof TwentyRequestError && error.status === 404) {
        throw new DesktopRecorderUnavailableError(serverUrl);
      }
      throw error;
    }
  }

  private async discoverEndpoint(
    credentials: Credentials,
    signal?: AbortSignal,
  ): Promise<ConnectionContext> {
    const [configuration, metadata] = await Promise.all([
      requestJson(`${credentials.serverUrl}/client-config`, { signal }),
      requestJson(`${credentials.serverUrl}/metadata`, {
        signal,
        method: 'POST',
        headers: {
          Authorization: `Bearer ${credentials.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query:
            'query CompanionWorkspace { currentWorkspace { id displayName logo subdomain workspaceUrls { subdomainUrl customUrl } } }',
        }),
      }),
    ]);
    const graphQlErrors = z
      .object({ errors: z.array(z.object({ message: z.string() })).min(1) })
      .safeParse(metadata);
    if (graphQlErrors.success) {
      throw new Error(
        'Twenty could not load your workspace. Try refreshing, or reconnect in Settings if this continues.',
      );
    }
    const { publicFunctionDomain } = z
      .object({ publicFunctionDomain: z.string().nullable().optional() })
      .parse(configuration);
    const { currentWorkspace } = z
      .object({
        data: z.object({
          currentWorkspace: z.object({
            id: z.string(),
            displayName: z.string().nullable(),
            logo: z.string().nullable().optional(),
            subdomain: z.string(),
            workspaceUrls: z.object({
              subdomainUrl: z.string().url(),
              customUrl: z.string().url().nullable().optional(),
            }),
          }),
        }),
      })
      .parse(metadata).data;
    const workspace: Agenda['workspace'] = {
      id: currentWorkspace.id,
      name: currentWorkspace.displayName ?? currentWorkspace.subdomain,
    };
    const logoUrl = resolveImageUrl(
      currentWorkspace.logo,
      credentials.serverUrl,
    );
    if (logoUrl) workspace.logoUrl = logoUrl;
    const workspaceUrl = validateServerUrl(
      currentWorkspace.workspaceUrls.customUrl ??
        currentWorkspace.workspaceUrls.subdomainUrl,
    );
    const functionsBaseUrl = getFunctionsBaseUrl({
      serverBaseUrl: credentials.serverUrl,
      publicFunctionDomain,
      workspaceSubdomain: currentWorkspace.subdomain,
    });
    validateServerUrl(new URL(functionsBaseUrl).origin);
    return {
      endpoint: `${functionsBaseUrl}/companion/desktop`,
      workspace,
      workspaceUrl,
    };
  }

  private async refresh(): Promise<void> {
    const previous = this.credentials;
    if (!previous) return;
    const credentials = await refreshCredentials(previous);
    if (this.credentials !== previous) return;
    this.credentials = credentials;
    await this.persistCredentials(() =>
      this.store.writeCredentials(credentials),
    );
  }
}
