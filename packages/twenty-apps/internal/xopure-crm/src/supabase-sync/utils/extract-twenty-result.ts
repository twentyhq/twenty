import type { TwentyConnection } from '../types/twenty-client-like.type';

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

export const extractConnection = <TNode>(
  result: unknown,
  fieldName: string,
): TwentyConnection<TNode> => {
  if (!isObject(result)) {
    return { edges: [] };
  }

  const connection = result[fieldName];

  if (!isObject(connection)) {
    return { edges: [] };
  }

  const edges = connection.edges;

  return {
    edges: Array.isArray(edges) ? (edges as Array<{ node: TNode }>) : [],
  };
};

export const extractMutationRecord = <TRecord extends Record<string, unknown>>(
  result: unknown,
  fieldName: string,
): TRecord | null => {
  if (!isObject(result)) {
    return null;
  }

  const record = result[fieldName];

  return isObject(record) ? (record as TRecord) : null;
};

export const isUniqueViolationError = (error: unknown): boolean => {
  const text =
    error instanceof Error
      ? error.message
      : typeof error === 'object' && error !== null
        ? JSON.stringify(error)
        : typeof error === 'string'
          ? error
          : '';
  const lower = text.toLowerCase();

  return (
    lower.includes('duplicate') ||
    lower.includes('unique constraint') ||
    lower.includes('uniqueness') ||
    lower.includes('already exists') ||
    lower.includes('violates unique')
  );
};
