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

const APP_ACCESS_TOKEN_ENV_KEY = 'TWENTY_APP_ACCESS_TOKEN';
const APP_APPLICATION_ACCESS_TOKEN_ENV_KEY =
  'TWENTY_APP_APPLICATION_ACCESS_TOKEN';
const API_KEY_ENV_KEY = 'TWENTY_API_KEY';

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

type FilesFieldUploadTarget = {
  fileId: string;
  uploadUrl: string;
  contentType: string;
};

type FilesFieldUploadedFile = {
  id: string;
  path: string;
  size: number;
  createdAt: string;
  url: string;
};

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

    // Priority: explicit header > the token for the requested access > api key
    // (legacy).
    this.authorizationToken =
      tokenFromHeaders ??
      processEnvironment[
        runAs === 'application'
          ? APP_APPLICATION_ACCESS_TOKEN_ENV_KEY
          : APP_ACCESS_TOKEN_ENV_KEY
      ] ??
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
  async uploadFile({
    file,
    filename,
    fieldMetadataUniversalIdentifier,
  }: {
    file: Blob | ArrayBuffer | ArrayBufferView;
    filename: string;
    fieldMetadataUniversalIdentifier: string;
  }): Promise<FilesFieldUploadedFile> {
    try {
      return await this.uploadFileToStorage({
        file,
        filename,
        fieldMetadataUniversalIdentifier,
      });
    } catch {
      return this.deprecatedUploadFile(
        file,
        filename,
        file instanceof Blob && file.type !== ''
          ? file.type
          : 'application/octet-stream',
        fieldMetadataUniversalIdentifier,
      );
    }
  }

  async deprecatedUploadFile(
    file: Blob | ArrayBuffer | ArrayBufferView,
    filename: string,
    contentType: string = 'application/octet-stream',
    fieldMetadataUniversalIdentifier: string,
  ): Promise<FilesFieldUploadedFile> {
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
      new Blob([file as BlobPart], { type: contentType }),
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

    return data.uploadFilesFieldFileByUniversalIdentifier as FilesFieldUploadedFile;
  }

  private async uploadFileToStorage({
    file,
    filename,
    fieldMetadataUniversalIdentifier,
  }: {
    file: Blob | ArrayBuffer | ArrayBufferView;
    filename: string;
    fieldMetadataUniversalIdentifier: string;
  }): Promise<FilesFieldUploadedFile> {
    const size = file instanceof Blob ? file.size : file.byteLength;

    const { createFileUpload: uploadTarget } =
      await this.executeMutationOrThrow<{
        createFileUpload: FilesFieldUploadTarget;
      }>({
        query: `mutation CreateFilesFieldFileUpload($filename: String!, $size: Float!, $fieldMetadataUniversalIdentifier: String!) {
        createFileUpload(filename: $filename, size: $size, fileFolder: FilesField, fieldMetadataUniversalIdentifier: $fieldMetadataUniversalIdentifier) { fileId uploadUrl contentType }
      }`,
        variables: { filename, size, fieldMetadataUniversalIdentifier },
      });

    await this.putFileToUploadTarget({ file, uploadTarget });

    const { completeFileUpload: uploadedFile } =
      await this.executeMutationOrThrow<{
        completeFileUpload: FilesFieldUploadedFile;
      }>({
        query: `mutation CompleteFilesFieldFileUpload($fileId: String!) {
        completeFileUpload(fileId: $fileId) { id path size createdAt url }
      }`,
        variables: { fileId: uploadTarget.fileId },
      });

    return uploadedFile;
  }

  private async putFileToUploadTarget({
    file,
    uploadTarget,
  }: {
    file: Blob | ArrayBuffer | ArrayBufferView;
    uploadTarget: FilesFieldUploadTarget;
  }): Promise<void> {
    const fetchImplementation = this.getFetchImplementationOrThrow();

    const response = await fetchImplementation.call(
      globalThis,
      uploadTarget.uploadUrl,
      {
        method: 'PUT',
        headers: { 'Content-Type': uploadTarget.contentType },
        body: file as BodyInit,
        credentials: 'omit',
      },
    );

    if (!response.ok) {
      throw new Error(
        `File upload failed (${response.status} ${response.statusText}): ${await response.text()}`,
      );
    }
  }

  private async executeMutationOrThrow<TData>({
    query,
    variables,
  }: {
    query: string;
    variables: Record<string, unknown>;
  }): Promise<TData> {
    const result = await this.executeGraphqlRequestWithOptionalRefresh({
      operation: { query, variables },
    });

    if (result.errors) {
      throw new GenqlError(result.errors, result.data);
    }

    if (!result.data) {
      throw new Error('Empty GraphQL response');
    }

    return result.data as TData;
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
      token: this.authorizationToken,
    });

    if (this.shouldRefreshToken(firstResponse)) {
      const refreshedAccessToken = await this.requestRefreshedAccessToken();

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

  private async executeGraphqlRequest({
    operation,
    headers,
    requestInit,
    token,
  }: {
    operation: GraphqlOperation | GraphqlOperation[] | FormData;
    headers?: HeadersInit;
    requestInit?: RequestInit;
    token: string | null;
  }): Promise<GraphqlResponse> {
    const fetchImplementation = this.getFetchImplementationOrThrow();

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

    const response = await fetchImplementation.call(globalThis, this.url, {
      ...this.requestOptions,
      ...requestInit,
      method: requestInit?.method ?? 'POST',
      headers: requestHeaders,
      body:
        operation instanceof FormData ? operation : JSON.stringify(operation),
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
    };
  }

  private getFetchImplementationOrThrow(): typeof globalThis.fetch {
    if (!this.fetchImplementation) {
      throw new Error(
        'Global `fetch` function is not available, ' +
          'pass a fetch implementation to the Twenty client',
      );
    }

    return this.fetchImplementation;
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
