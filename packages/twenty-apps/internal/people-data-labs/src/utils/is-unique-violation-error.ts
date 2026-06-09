import { isObject } from '@sniptt/guards';

import { isDefined } from 'src/utils/is-defined';

const DUPLICATE_VIOLATION_PHRASES = [
  'duplicate',
  'unique constraint',
  'uniqueness',
  'already exists',
  'is already in use',
  'violates unique',
  'duplicate_entry_detected',
];

const MAX_ERROR_TRAVERSAL_DEPTH = 4;

const stringifyWithoutThrowingOnCycles = (value: unknown): string => {
  try {
    return JSON.stringify(value) ?? '';
  } catch {
    return '';
  }
};

const collectErrorText = (error: unknown, depth = 0): string => {
  if (!isDefined(error) || depth > MAX_ERROR_TRAVERSAL_DEPTH) {
    return '';
  }
  if (typeof error === 'string') {
    return error;
  }
  if (typeof error !== 'object') {
    return String(error);
  }

  const record = error as Record<string, unknown>;
  const textFragments: string[] = [];

  if (typeof record.message === 'string') {
    textFragments.push(record.message);
  }

  if (Array.isArray(record.graphQLErrors)) {
    for (const graphQLError of record.graphQLErrors) {
      textFragments.push(collectErrorText(graphQLError, depth + 1));
    }
  }

  if (isObject(record.extensions)) {
    const extensions = record.extensions as Record<string, unknown>;
    if (typeof extensions.code === 'string') {
      textFragments.push(extensions.code);
    }
    if (typeof extensions.userFriendlyMessage === 'string') {
      textFragments.push(extensions.userFriendlyMessage);
    }
  }

  if (isDefined(record.cause)) {
    textFragments.push(collectErrorText(record.cause, depth + 1));
  }

  textFragments.push(stringifyWithoutThrowingOnCycles(error));

  return textFragments.join(' ');
};

export const isUniqueViolationError = (error: unknown): boolean => {
  const lowerCaseText = collectErrorText(error).toLowerCase();

  return DUPLICATE_VIOLATION_PHRASES.some((phrase) =>
    lowerCaseText.includes(phrase),
  );
};
