// @ts-nocheck


import type {QueryGenqlSelection,Query,MutationGenqlSelection,Mutation,SubscriptionGenqlSelection,Subscription} from './schema'
  import { 
      linkTypeMap, 
      createClient as createClientOriginal, 
      generateGraphqlOperation,
      type FieldsSelection, type GraphqlOperation, type ClientOptions, GenqlError
  } from './runtime'
  export type { FieldsSelection } from './runtime'
  export { GenqlError }

  import types from './types'
  export * from './schema'
  const typeMap = linkTypeMap(types as any)

  
  export interface Client {
      
      query<R extends QueryGenqlSelection>(
          request: R & { __name?: string },
      ): Promise<FieldsSelection<Query, R>>
      
      mutation<R extends MutationGenqlSelection>(
          request: R & { __name?: string },
      ): Promise<FieldsSelection<Mutation, R>>
      
  }
  

  export const createClient = 
function(options?: ClientOptions): Client {
  return createClientOriginal({
      url: undefined,
      
      ...options,
      queryRoot: typeMap.Query!,
      mutationRoot: typeMap.Mutation!,
      subscriptionRoot: typeMap.Subscription!,
  }) as any
}

  export const everything = {
    __scalar: true
  }
  


        export type QueryResult<fields extends QueryGenqlSelection> = FieldsSelection<Query, fields>
        export const generateQueryOp: (fields: QueryGenqlSelection & { __name?: string }) => GraphqlOperation = function(fields) {
        return generateGraphqlOperation('query', typeMap.Query!, fields as any)
      }
    


        export type MutationResult<fields extends MutationGenqlSelection> = FieldsSelection<Mutation, fields>
        export const generateMutationOp: (fields: MutationGenqlSelection & { __name?: string }) => GraphqlOperation = function(fields) {
        return generateGraphqlOperation('mutation', typeMap.Mutation!, fields as any)
      }
    


        export type SubscriptionResult<fields extends SubscriptionGenqlSelection> = FieldsSelection<Subscription, fields>
        export const generateSubscriptionOp: (fields: SubscriptionGenqlSelection & { __name?: string }) => GraphqlOperation = function(fields) {
        return generateGraphqlOperation('subscription', typeMap.Subscription!, fields as any)
      }
    
// MetadataApiClient (auto-injected by twenty-client-sdk)
import type { TwentyClientRunAs } from '../shared/twenty-client-run-as.type';

// Ambient type stubs for the genql-generated code this template gets
// injected into. They enable full typecheck/lint on this file.

const API_URL_ENV_KEY = 'TWENTY_API_URL';
const APP_ACCESS_TOKEN_ENV_KEY = 'TWENTY_APP_ACCESS_TOKEN';
const APP_APPLICATION_ACCESS_TOKEN_ENV_KEY =
  'TWENTY_APP_APPLICATION_ACCESS_TOKEN';
const API_KEY_ENV_KEY = 'TWENTY_API_KEY';

// Kept in sync with shared/request-workspace-member-access-token.ts: this
// template is injected into generated clients that cannot import the package.
const GENERATE_APPLICATION_TOKEN_FOR_WORKSPACE_MEMBER_MUTATION = `mutation GenerateApplicationTokenForWorkspaceMember($workspaceMemberId: UUID!) {
  generateApplicationTokenForWorkspaceMember(workspaceMemberId: $workspaceMemberId) {
    token
  }
}`;

export type MetadataApiClientOptions = ClientOptions & {
  runAs?: TwentyClientRunAs;
};

type ProcessEnvironment = Record<string, string | undefined>;

type GraphqlErrorPayloadEntry = {
  message?: string;
  extensions?: { code?: string };
};

type GraphqlResponsePayload = {
  data?: Record<string, unknown>;
  errors?: GraphqlErrorPayloadEntry[];
};

type GraphqlResponse = {
  status: number;
  statusText: string;
  payload: GraphqlResponsePayload | null;
  rawBody: string;
};

type WorkspaceMemberTokenResponsePayload = {
  data?: {
    generateApplicationTokenForWorkspaceMember?: { token?: string };
  };
};

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.length > 0;

const getProcessEnvironment = (): ProcessEnvironment => {
  const processObject = (
    globalThis as { process?: { env?: ProcessEnvironment } }
  ).process;

  return processObject?.env ?? {};
};

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
};

const getTokenFromHeaders = (
  headers: HeadersInit | undefined,
): string | null => {
  if (!headers) {
    return null;
  }

  if (headers instanceof Headers) {
    return getTokenFromAuthorizationHeader(
      headers.get('Authorization') ?? undefined,
    );
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
};

const hasAuthenticationErrorInGraphqlPayload = (
  payload: GraphqlResponsePayload | null,
): boolean => {
  if (!payload?.errors) {
    return false;
  }

  return payload.errors.some((graphqlError) => {
    return (
      graphqlError.extensions?.code === 'UNAUTHENTICATED' ||
      graphqlError.message?.toLowerCase() === 'unauthorized'
    );
  });
};

const defaultOptions: MetadataApiClientOptions = {
  url: `${process.env.TWENTY_API_URL}/metadata`,
  headers: {
    'Content-Type': 'application/json',
  },
};

export class MetadataApiClient {
  private client: Client;
  private url: string;
  private requestOptions: RequestInit;
  private headers: HeadersInit | (() => HeadersInit | Promise<HeadersInit>);
  private fetchImplementation: typeof globalThis.fetch | null;
  private authorizationToken: string | null;
  private runAsWorkspaceMemberId: string | null;
  private workspaceMemberTokenPromise: Promise<string> | null = null;
  private holdsExchangedWorkspaceMemberToken = false;
  private refreshAccessTokenPromise: Promise<string | null> | null = null;

  constructor(options?: MetadataApiClientOptions) {
    const merged: MetadataApiClientOptions = {
      ...defaultOptions,
      ...options,
    };

    const {
      url,
      headers,
      fetch: customFetchImplementation,
      fetcher: _fetcher,
      batch: _batch,
      runAs,
      ...requestOptions
    } = merged;

    this.url = url ?? '';
    this.requestOptions = requestOptions;
    this.headers = headers ?? {};
    this.fetchImplementation =
      customFetchImplementation ?? globalThis.fetch ?? null;

    const processEnvironment = getProcessEnvironment();
    const tokenFromHeaders = getTokenFromHeaders(
      typeof headers === 'function' ? undefined : headers,
    );

    this.runAsWorkspaceMemberId =
      typeof runAs === 'object' ? runAs.workspaceMemberId : null;

    // Priority: explicit header > the token for the requested access > api key
    // (legacy). A workspace member token is exchanged on the first request.
    this.authorizationToken =
      tokenFromHeaders ??
      (this.runAsWorkspaceMemberId !== null
        ? null
        : (processEnvironment[
            runAs === 'application'
              ? APP_APPLICATION_ACCESS_TOKEN_ENV_KEY
              : APP_ACCESS_TOKEN_ENV_KEY
          ] ??
          processEnvironment[API_KEY_ENV_KEY] ??
          null));

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
        query: `mutation UploadFilesFieldFileByUniversalIdentifier($file: Upload!, $fieldMetadataUniversalIdentifier: String!) {
        uploadFilesFieldFileByUniversalIdentifier(file: $file, fieldMetadataUniversalIdentifier: $fieldMetadataUniversalIdentifier) { id path size createdAt url }
      }`,
        variables: {
          file: null,
          fieldMetadataUniversalIdentifier,
        },
      }),
    );
    form.append('map', JSON.stringify({ '0': ['variables.file'] }));
    form.append(
      '0',
      new Blob([fileBuffer as BlobPart], { type: contentType }),
      filename,
    );

    const result = await this.executeGraphqlRequestWithOptionalRefresh({
      operation: form,
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
    };
  }

  private async executeGraphqlRequestWithOptionalRefresh({
    operation,
    headers,
    requestInit,
  }: {
    operation: GraphqlOperation | GraphqlOperation[] | FormData;
    headers?: HeadersInit;
    requestInit?: RequestInit;
  }) {
    const firstResponse = await this.executeGraphqlRequest({
      operation,
      headers,
      requestInit,
      token: await this.resolveAuthorizationToken(),
    });

    if (this.shouldRefreshToken(firstResponse)) {
      const refreshedAccessToken =
        (await this.requestReexchangedWorkspaceMemberToken()) ??
        (await this.requestRefreshedAccessToken());

      if (refreshedAccessToken) {
        const retryResponse = await this.executeGraphqlRequest({
          operation,
          headers,
          requestInit,
          token: refreshedAccessToken,
        });

        return this.assertResponseIsSuccessful(retryResponse);
      }
    }

    return this.assertResponseIsSuccessful(firstResponse);
  }

  private async resolveAuthorizationToken(): Promise<string | null> {
    if (this.runAsWorkspaceMemberId === null) {
      return this.authorizationToken;
    }

    // A headers callback is only known at request time and may change its
    // answer; a credential it carries is the caller's own and wins over the
    // member token, cached or not.
    const tokenFromResolvedHeaders = getTokenFromHeaders(
      await this.resolveHeaders(),
    );

    if (isNonEmptyString(tokenFromResolvedHeaders)) {
      return tokenFromResolvedHeaders;
    }

    if (this.authorizationToken !== null) {
      return this.authorizationToken;
    }

    if (!this.workspaceMemberTokenPromise) {
      this.workspaceMemberTokenPromise = this.requestWorkspaceMemberAccessToken(
        this.runAsWorkspaceMemberId,
      )
        .then((workspaceMemberAccessToken) => {
          this.authorizationToken = workspaceMemberAccessToken;
          this.holdsExchangedWorkspaceMemberToken = true;

          return workspaceMemberAccessToken;
        })
        .catch((exchangeError: unknown) => {
          this.workspaceMemberTokenPromise = null;

          throw exchangeError;
        });
    }

    return this.workspaceMemberTokenPromise;
  }

  // A member token is short-lived; when the server stops accepting the cached
  // one, the client exchanges again rather than keeping a dead credential.
  private async requestReexchangedWorkspaceMemberToken(): Promise<
    string | null
  > {
    if (!this.holdsExchangedWorkspaceMemberToken) {
      return null;
    }

    this.authorizationToken = null;
    this.holdsExchangedWorkspaceMemberToken = false;
    this.workspaceMemberTokenPromise = null;

    try {
      return await this.resolveAuthorizationToken();
    } catch (exchangeError: unknown) {
      console.error(
        'Twenty client: workspace member token exchange failed',
        exchangeError,
      );

      return null;
    }
  }

  // Only a logic function run holds an application token, so acting as a
  // member is exchanged there: the server intersects the member's role with
  // the application's, which is why the exchange needs no extra permission.
  private async requestWorkspaceMemberAccessToken(
    workspaceMemberId: string,
  ): Promise<string> {
    const processEnvironment = getProcessEnvironment();
    const applicationAccessToken =
      processEnvironment[APP_APPLICATION_ACCESS_TOKEN_ENV_KEY];
    const apiUrl = processEnvironment[API_URL_ENV_KEY];

    if (!isNonEmptyString(applicationAccessToken)) {
      throw new Error(
        `Acting as a workspace member needs the \`${APP_APPLICATION_ACCESS_TOKEN_ENV_KEY}\` environment variable, which only a logic function run provides.`,
      );
    }

    if (!isNonEmptyString(apiUrl)) {
      throw new Error(
        `Acting as a workspace member needs the \`${API_URL_ENV_KEY}\` environment variable.`,
      );
    }

    const response = await this.executeGraphqlRequest({
      operation: {
        query: GENERATE_APPLICATION_TOKEN_FOR_WORKSPACE_MEMBER_MUTATION,
        variables: { workspaceMemberId },
      },
      token: applicationAccessToken,
      url: `${apiUrl.replace(/\/+$/, '')}/metadata`,
    });

    const token = (
      response.payload as WorkspaceMemberTokenResponsePayload | null
    )?.data?.generateApplicationTokenForWorkspaceMember?.token;

    if (isNonEmptyString(token)) {
      return token;
    }

    const reason =
      response.payload?.errors?.[0]?.message ??
      (response.status >= 200 && response.status < 300
        ? response.rawBody
        : `${response.status} ${response.statusText}`);

    throw new Error(
      `Could not act as workspace member ${workspaceMemberId}: ${reason}`,
    );
  }

  private async executeGraphqlRequest({
    operation,
    headers,
    requestInit,
    token,
    url,
  }: {
    operation: GraphqlOperation | GraphqlOperation[] | FormData;
    headers?: HeadersInit;
    requestInit?: RequestInit;
    token: string | null;
    url?: string;
  }): Promise<GraphqlResponse> {
    if (!this.fetchImplementation) {
      throw new Error(
        'Global `fetch` function is not available, ' +
          'pass a fetch implementation to the Twenty client',
      );
    }

    const resolvedHeaders = await this.resolveHeaders();
    const requestHeaders = new Headers(resolvedHeaders);

    if (headers) {
      new Headers(headers).forEach((value, key) =>
        requestHeaders.set(key, value),
      );
    }

    if (operation instanceof FormData) {
      requestHeaders.delete('Content-Type');
    } else {
      requestHeaders.set('Content-Type', 'application/json');
    }

    if (token) {
      requestHeaders.set('Authorization', `Bearer ${token}`);
    } else {
      requestHeaders.delete('Authorization');
    }

    const response = await this.fetchImplementation.call(
      globalThis,
      url ?? this.url,
      {
        ...this.requestOptions,
        ...requestInit,
        method: requestInit?.method ?? 'POST',
        headers: requestHeaders,
        body:
          operation instanceof FormData ? operation : JSON.stringify(operation),
      },
    );

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
    };
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
      throw new Error(`${response.statusText}: ${response.rawBody}`);
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
          requestAccessTokenRefresh?: () => Promise<string>;
        };
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
        .catch((refreshError: unknown) => {
          console.error('Twenty client: token refresh failed', refreshError);

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
  }
}
