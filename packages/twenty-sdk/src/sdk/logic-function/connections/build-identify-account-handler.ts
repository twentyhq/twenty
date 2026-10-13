import { isNonEmptyString, isNumber } from '@sniptt/guards';
import {
  type IdentifyAccountPayload,
  type IdentifyAccountResult,
} from 'twenty-shared/application';
import { isPlainObject } from 'twenty-shared/utils';

export type IdentifyAccountRequest = {
  endpoint: string;
  method?: 'GET' | 'POST';
  body?: string;
  headers?: Record<string, string>;
  // Dot path into the JSON response, e.g. 'team.id'.
  externalAccountIdPath: string;
  handlePath?: string;
};

const resolveDotPath = (value: unknown, path: string): unknown =>
  path
    .split('.')
    .reduce<unknown>(
      (current, segment) =>
        isPlainObject(current) ? current[segment] : undefined,
      value,
    );

// Some providers return numeric ids (e.g. GitHub user ids).
const stringifyIdentifier = (value: unknown): string | undefined => {
  if (isNumber(value)) {
    return String(value);
  }

  return isNonEmptyString(value) && isNonEmptyString(value.trim())
    ? value.trim()
    : undefined;
};

export const buildIdentifyAccountHandler =
  ({
    endpoint,
    method = 'GET',
    body,
    headers,
    externalAccountIdPath,
    handlePath,
  }: IdentifyAccountRequest) =>
  async (payload: IdentifyAccountPayload): Promise<IdentifyAccountResult> => {
    const response = await fetch(endpoint, {
      method,
      headers: {
        Accept: 'application/json',
        ...headers,
        Authorization: `Bearer ${payload.accessToken}`,
      },
      body,
    });

    if (!response.ok) {
      throw new Error(
        `identifyAccount: ${method} ${endpoint} failed with HTTP ${response.status} ${response.statusText}`,
      );
    }

    const responseBody: unknown = await response.json();

    const externalAccountId = stringifyIdentifier(
      resolveDotPath(responseBody, externalAccountIdPath),
    );

    if (externalAccountId === undefined) {
      throw new Error(
        `identifyAccount: ${method} ${endpoint} returned no value at "${externalAccountIdPath}"`,
      );
    }

    if (handlePath === undefined) {
      return { externalAccountId };
    }

    const handle = resolveDotPath(responseBody, handlePath);

    return isNonEmptyString(handle) && isNonEmptyString(handle.trim())
      ? { externalAccountId, handle: handle.trim() }
      : { externalAccountId };
  };
