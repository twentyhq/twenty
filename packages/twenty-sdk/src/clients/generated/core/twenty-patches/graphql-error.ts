// Lightweight replacement for GenqlError — no genql dependency.

type GraphqlErrorEntry = {
  message?: string;
  locations?: Array<{ line: number; column: number }>;
  path?: string[];
  extensions?: Record<string, unknown>;
};

export class CoreGraphqlError extends Error {
  errors: GraphqlErrorEntry[];
  data?: unknown;

  constructor(errors: GraphqlErrorEntry[], data?: unknown) {
    const message =
      errors.map((entry) => entry?.message || '').join('\n') ||
      'GraphQL error';

    super(message);
    this.errors = errors;
    this.data = data;
  }
}
