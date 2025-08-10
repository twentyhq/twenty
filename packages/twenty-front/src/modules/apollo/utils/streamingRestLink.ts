import {
  ApolloLink,
  Observable,
  type Operation,
  type ServerError,
} from '@apollo/client/core';
import { type FetchResult } from '@apollo/client/link/core';
import { type ArgumentNode, type DirectiveNode } from 'graphql';
import { isDefined } from 'twenty-shared/utils';

type StreamingRestLinkOptions = {
  uri: string;
  headers?: Record<string, string>;
  credentials?: RequestCredentials;
};

type StreamDirective = {
  type?: string;
  path?: string;
  method?: string;
  bodyKey?: string;
  headers?: Record<string, string>;
};

export class StreamingRestLink extends ApolloLink {
  private readonly baseUri: string;
  private readonly defaultHeaders: Record<string, string>;

  constructor(options: StreamingRestLinkOptions) {
    super();
    this.baseUri = options.uri;
    this.defaultHeaders = options.headers || {};
  }

  public request(
    operation: Operation,
    forward: (operation: Operation) => Observable<FetchResult>,
  ): Observable<FetchResult> {
    const streamDirective = this.extractStreamDirective(operation);

    if (!streamDirective) {
      return forward(operation);
    }

    const { uri, onChunk, headers } = operation.getContext();

    return new Observable((observer) => {
      const controller = new AbortController();
      const url = this.buildUrl({
        uri,
        streamDirective,
        operation,
      });

      const requestConfig = this.buildRequestConfig({
        operation,
        streamDirective,
        headers,
        signal: controller.signal,
      });

      fetch(url, requestConfig)
        .then(async (response) => {
          if (!response.ok) {
            const networkError = new Error(
              `HTTP error! status: ${response.status}`,
            ) as ServerError;

            networkError.statusCode = response.status;

            throw networkError;
          }

          if (!response.body) {
            throw new Error('Response body is null');
          }

          const reader = response.body.getReader();
          const decoder = new TextDecoder();

          let isStreaming = true;
          while (isStreaming) {
            const { done, value } = await reader.read();

            if (done) {
              observer.complete();
              isStreaming = false;
              continue;
            }

            const decodedChunk = decoder.decode(value, { stream: true });

            if (isDefined(onChunk) && typeof onChunk === 'function') {
              onChunk(decodedChunk);
            }
          }
        })
        .catch((error) => {
          observer.error(error);
        });

      return () => controller.abort();
    });
  }

  private extractStreamDirective(operation: Operation): StreamDirective | null {
    try {
      const definition = operation.query.definitions[0];

      if (!definition || definition.kind !== 'OperationDefinition') {
        return null;
      }

      if (
        !definition.selectionSet ||
        !definition.selectionSet.selections ||
        definition.selectionSet.selections.length === 0
      ) {
        return null;
      }

      const selection = definition.selectionSet.selections[0];

      if (!selection || !isDefined(selection.directives)) {
        return null;
      }

      const streamDirective = selection.directives.find(
        (d: DirectiveNode) => d.name.value === 'stream',
      );

      if (!isDefined(streamDirective)) {
        return null;
      }

      const args = streamDirective.arguments || [];
      const directive: StreamDirective = {};

      args.forEach((arg: ArgumentNode) => {
        if (arg.value.kind === 'StringValue') {
          const value = arg.value.value;
          switch (arg.name.value) {
            case 'path':
              directive.path = value;
              break;
            case 'type':
              directive.type = value;
              break;
            case 'method':
              directive.method = value;
              break;
            case 'bodyKey':
              directive.bodyKey = value;
              break;
          }
        }
      });

      return directive;
    } catch {
      return null;
    }
  }

  private buildUrl({
    uri,
    streamDirective,
    operation,
  }: {
    uri?: string;
    streamDirective?: StreamDirective | null;
    operation?: Operation;
  }): string {
    if (isDefined(uri)) {
      return uri.startsWith('http') ? uri : `${this.baseUri}${uri}`;
    }

    if (isDefined(streamDirective?.path)) {
      let path = streamDirective.path;

      if (isDefined(operation?.variables)) {
        Object.entries(operation.variables).forEach(([key, value]) => {
          path = path.replace(`{args.${key}}`, String(value));
        });
      }

      return `${this.baseUri}${path}`;
    }

    throw new Error('No valid URL found');
  }

  private buildRequestConfig({
    operation,
    streamDirective,
    headers,
    signal,
  }: {
    operation: Operation;
    streamDirective?: StreamDirective | null;
    headers?: Record<string, string>;
    signal?: AbortSignal;
  }): RequestInit {
    const method = streamDirective?.method || 'POST';
    let body: string | undefined;

    if (isDefined(streamDirective?.bodyKey) && isDefined(operation.variables)) {
      body = JSON.stringify(operation.variables[streamDirective.bodyKey]);
    } else {
      body = JSON.stringify(operation.variables);
    }

    return {
      method,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'text/event-stream',
        ...this.defaultHeaders,
        ...headers,
        ...streamDirective?.headers,
      },
      body,
      signal,
    };
  }
}
