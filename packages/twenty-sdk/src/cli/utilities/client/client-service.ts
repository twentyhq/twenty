import { ApiService } from '@/cli/utilities/api/api-service';
import { generate } from '@genql/cli';
import * as fs from 'fs-extra';
import { join } from 'path';
import {
  DEFAULT_APP_ACCESS_TOKEN_NAME,
  DEFAULT_API_KEY_NAME,
  DEFAULT_API_URL_NAME,
  GENERATED_DIR,
} from 'twenty-shared/application';

export class ClientService {
  private apiService: ApiService;

  constructor() {
    this.apiService = new ApiService({ disableInterceptors: true });
  }

  async generate({
    appPath,
    authToken,
  }: {
    appPath: string;
    authToken?: string;
  }): Promise<void> {
    const outputPath = this.resolveGeneratedPath(appPath);
    const tempPath = `${outputPath}.tmp`;

    const getSchemaResponse = await this.apiService.getSchema({ authToken });

    if (!getSchemaResponse.success) {
      throw new Error(
        `Failed to introspect schema: ${JSON.stringify(getSchemaResponse.error)}`,
      );
    }

    const { data: schema } = getSchemaResponse;

    await fs.ensureDir(tempPath);
    await fs.emptyDir(tempPath);

    await generate({
      schema,
      output: tempPath,
      scalarTypes: {
        DateTime: 'string',
        JSON: 'Record<string, unknown>',
        UUID: 'string',
      },
    });

    await this.injectTwentyClient(tempPath);

    await fs.remove(outputPath);
    await fs.move(tempPath, outputPath);
  }

  private resolveGeneratedPath(appPath: string): string {
    return join(appPath, 'node_modules', 'twenty-sdk', GENERATED_DIR);
  }

  private async injectTwentyClient(output: string) {
    const twentyClientContent = `

// ----------------------------------------------------
// Custom Twenty client (auto-injected)
// ----------------------------------------------------

const APP_ACCESS_TOKEN_ENV_KEY = '${DEFAULT_APP_ACCESS_TOKEN_NAME}';
const API_KEY_ENV_KEY = '${DEFAULT_API_KEY_NAME}';

type TwentyClientOptions = ClientOptions & {
  metadataUrl?: string;
}

type ProcessEnvironment = Record<string, string | undefined>

type GraphqlError = {
  message?: string;
  extensions?: { code?: string };
}

type GraphqlResponsePayload = {
  data?: Record<string, unknown>
  errors?: GraphqlError[];
}

type GraphqlResponse = {
  status: number;
  statusText: string;
  payload: GraphqlResponsePayload | null;
  rawBody: string;
}

const getProcessEnvironment = (): ProcessEnvironment => {
  const processObject = (globalThis as { process?: { env?: ProcessEnvironment } })
    .process;

  return processObject?.env ?? {};
}

const getTokenFromAuthorizationHeader = (
  authorizationHeader: string | undefined,
): string | null => {
  if (typeof authorizationHeader !== 'string') {
    return null;
  }

  const trimmedAuthorizationHeader = authorizationHeader.trim();

  if (trimmedAuthorizationHeader.length === 0) {
    return null;
  }

  if (trimmedAuthorizationHeader === 'Bearer') {
    return null;
  }

  if (trimmedAuthorizationHeader.startsWith('Bearer ')) {
    return trimmedAuthorizationHeader.slice('Bearer '.length).trim();
  }

  return trimmedAuthorizationHeader;
}

const getTokenFromHeaders = (headers: HeadersInit | undefined): string | null => {
  if (!headers) {
    return null;
  }

  if (headers instanceof Headers) {
    return getTokenFromAuthorizationHeader(headers.get('Authorization') ?? undefined);
  }

  if (Array.isArray(headers)) {
    const matchedAuthorizationHeader = headers.find(
      ([headerName]) => headerName.toLowerCase() === 'authorization',
    );

    return getTokenFromAuthorizationHeader(matchedAuthorizationHeader?.[1]);
  }

  const headersRecord = headers as Record<string, string | undefined>;

  return getTokenFromAuthorizationHeader(
    headersRecord.Authorization ?? headersRecord.authorization,
  );
}

const hasAuthenticationErrorInGraphqlPayload = (
  payload: GraphqlResponsePayload | null,
): boolean => {
  if (!payload?.errors) {
    return false;
  }

  return payload.errors.some((error) => {
    return (
      error.extensions?.code === 'UNAUTHENTICATED' ||
      // Fallback for payloads that don't provide structured error codes.
      error.message?.toLowerCase() === 'unauthorized'
    );
  });
}

const defaultOptions: TwentyClientOptions = {
  url: \`\${process.env.${DEFAULT_API_URL_NAME}}/graphql\`,
  metadataUrl: \`\${process.env.${DEFAULT_API_URL_NAME}}/metadata\`,
  headers: {
    'Content-Type': 'application/json',
  },
}

export default class Twenty {
  private client: Client;
  private url: string;
  private metadataUrl: string;
  private requestOptions: RequestInit;
  private headers: HeadersInit | (() => HeadersInit | Promise<HeadersInit>);
  private fetchImplementation: typeof globalThis.fetch | null;
  private authorizationToken: string | null;
  private refreshAccessTokenPromise: Promise<string | null> | null = null;

  constructor(options?: TwentyClientOptions) {
    const merged: TwentyClientOptions = {
      ...defaultOptions,
      ...options,
    }

    const {
      url,
      metadataUrl,
      headers,
      fetch: customFetchImplementation,
      fetcher: _fetcher,
      batch: _batch,
      ...requestOptions
    } = merged;

    this.url = url ?? '';
    this.metadataUrl = metadataUrl ?? this.url.replace(/\\/graphql$/, '/metadata');
    this.requestOptions = requestOptions;
    this.headers = headers ?? {};
    this.fetchImplementation = customFetchImplementation ?? globalThis.fetch ?? null;

    const processEnvironment = getProcessEnvironment();
    const tokenFromHeaders = getTokenFromHeaders(
      typeof headers === 'function' ? undefined : headers,
    );

    // Priority: explicit header > TWENTY_APP_ACCESS_TOKEN > TWENTY_API_KEY (legacy fallback).
    this.authorizationToken =
      tokenFromHeaders ??
      processEnvironment[APP_ACCESS_TOKEN_ENV_KEY] ??
      processEnvironment[API_KEY_ENV_KEY] ??
      null;

    this.client = createClient({
      ...merged,
      headers: undefined,
      fetcher: async (operation) =>
        this.executeGraphqlRequestWithOptionalRefresh({
          operation,
        }),
    });
  }

  query<R extends QueryGenqlSelection>(request: R & { __name?: string }) {
    return this.client.query(request);
  }

  mutation<R extends MutationGenqlSelection>(request: R & { __name?: string }) {
    return this.client.mutation(request);
  }

  async uploadFile(
    fileBuffer: Buffer,
    filename: string,
    contentType: string = 'application/octet-stream',
    fieldMetadataUniversalIdentifier: string,
  ): Promise<{
    id: string;
    path: string;
    size: number;
    createdAt: string;
    url: string;
  }> {
    const form = new FormData();

    form.append(
      'operations',
      JSON.stringify({
        query: \`mutation UploadFilesFieldFileByUniversalIdentifier($file: Upload!, $fieldMetadataUniversalIdentifier: String!) {
        uploadFilesFieldFileByUniversalIdentifier(file: $file, fieldMetadataUniversalIdentifier: $fieldMetadataUniversalIdentifier) { id path size createdAt url }
      }\`,
        variables: { file: null, fieldMetadataUniversalIdentifier },
      }),
    );
    form.append('map', JSON.stringify({ '0': ['variables.file'] }));
    form.append('0', new Blob([fileBuffer], { type: contentType }), filename);

    const result = await this.executeGraphqlRequestWithOptionalRefresh({
      operation: form,
      url: this.metadataUrl,
      headers: {},
      requestInit: {
        method: 'POST',
      },
    });

    if (result.errors) {
      throw new GenqlError(result.errors, result.data);
    }

    const data = result.data as Record<string, unknown>;

    return data.uploadFilesFieldFileByUniversalIdentifier as {
      id: string;
      path: string;
      size: number;
      createdAt: string;
      url: string;
    }
  }

  private async executeGraphqlRequestWithOptionalRefresh({
    operation,
    url = this.url,
    headers,
    requestInit,
  }: {
    operation: GraphqlOperation | GraphqlOperation[] | FormData;
    url?: string;
    headers?: HeadersInit;
    requestInit?: RequestInit;
  }) {
    const firstResponse = await this.executeGraphqlRequest({
      operation,
      url,
      headers,
      requestInit,
      token: this.authorizationToken,
    });

    if (this.shouldRefreshToken(firstResponse)) {
      const refreshedAccessToken = await this.requestRefreshedAccessToken();

      if (refreshedAccessToken) {
        const retryResponse = await this.executeGraphqlRequest({
          operation,
          url,
          headers,
          requestInit,
          token: refreshedAccessToken,
        });

        return this.assertResponseIsSuccessful(retryResponse);
      }
    }

    return this.assertResponseIsSuccessful(firstResponse);
  }

  private async executeGraphqlRequest({
    operation,
    url,
    headers,
    requestInit,
    token,
  }: {
    operation: GraphqlOperation | GraphqlOperation[] | FormData;
    url: string;
    headers?: HeadersInit;
    requestInit?: RequestInit;
    token: string | null;
  }): Promise<GraphqlResponse> {
    if (!this.fetchImplementation) {
      throw new Error(
        'Global \`fetch\` function is not available, pass a fetch implementation to the Twenty client',
      );
    }

    const resolvedHeaders = await this.resolveHeaders();
    const requestHeaders = new Headers(resolvedHeaders);

    if (headers) {
      new Headers(headers).forEach((value, key) => requestHeaders.set(key, value));
    }

    if (operation instanceof FormData) {
      requestHeaders.delete('Content-Type');
    } else {
      requestHeaders.set('Content-Type', 'application/json');
    }

    if (token) {
      requestHeaders.set('Authorization', \`Bearer \${token}\`);
    } else {
      requestHeaders.delete('Authorization');
    }

    const response = await this.fetchImplementation.call(globalThis, url, {
      ...this.requestOptions,
      ...requestInit,
      method: requestInit?.method ?? 'POST',
      headers: requestHeaders,
      body: operation instanceof FormData ? operation : JSON.stringify(operation),
    });

    const rawBody = await response.text();
    let payload: GraphqlResponsePayload | null = null;

    if (rawBody.trim().length > 0) {
      try {
        payload = JSON.parse(rawBody) as GraphqlResponsePayload;
      } catch {
        payload = null;
      }
    }

    return {
      status: response.status,
      statusText: response.statusText,
      payload,
      rawBody,
    }
  }

  private async resolveHeaders(): Promise<HeadersInit> {
    if (typeof this.headers === 'function') {
      return (await this.headers()) ?? {};
    }

    return this.headers ?? {};
  }

  private shouldRefreshToken(response: GraphqlResponse): boolean {
    if (response.status === 401) {
      return true;
    }

    return hasAuthenticationErrorInGraphqlPayload(response.payload);
  }

  private assertResponseIsSuccessful(response: GraphqlResponse) {
    if (response.status < 200 || response.status >= 300) {
      throw new Error(\`\${response.statusText}: \${response.rawBody}\`);
    }

    if (response.payload === null) {
      throw new Error('Invalid JSON response');
    }

    return response.payload;
  }

  private async requestRefreshedAccessToken(): Promise<string | null> {
    const refreshAccessTokenFunction = (
      globalThis as {
        frontComponentHostCommunicationApi?: {
          requestAccessTokenRefresh?: () => Promise<string>
        }
      }
    ).frontComponentHostCommunicationApi?.requestAccessTokenRefresh;

    if (typeof refreshAccessTokenFunction !== 'function') {
      return null;
    }

    if (!this.refreshAccessTokenPromise) {
      this.refreshAccessTokenPromise = refreshAccessTokenFunction()
        .then((refreshedAccessToken) => {
          if (
            typeof refreshedAccessToken !== 'string' ||
            refreshedAccessToken.length === 0
          ) {
            return null;
          }

          this.setAuthorizationToken(refreshedAccessToken);

          return refreshedAccessToken;
        })
        .catch((error) => {
          console.error('Twenty client: token refresh failed', error);

          return null;
        })
        .finally(() => {
          this.refreshAccessTokenPromise = null;
        });
    }

    return this.refreshAccessTokenPromise;
  }

  private setAuthorizationToken(token: string) {
    this.authorizationToken = token;

    const processEnvironment = getProcessEnvironment();

    processEnvironment[APP_ACCESS_TOKEN_ENV_KEY] = token;
    processEnvironment[API_KEY_ENV_KEY] = token;
  }
}

`;

    await fs.appendFile(join(output, 'index.ts'), twentyClientContent);
  }
}
