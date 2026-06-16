import { isNonEmptyString, isObject } from '@sniptt/guards';

export const extractSharedWebhookTenantIdFromBody = ({
  body,
  tenantIdPaths,
}: {
  body: unknown;
  tenantIdPaths: string[];
}): string | undefined => {
  for (const tenantIdPath of tenantIdPaths) {
    const value = getValueAtPath(body, tenantIdPath);

    if (isNonEmptyString(value)) {
      return value;
    }
  }

  return undefined;
};

const getValueAtPath = (value: unknown, path: string): unknown =>
  path
    .split('.')
    .reduce<unknown>(
      (currentValue, pathPart) =>
        isObject(currentValue)
          ? (currentValue as Record<string, unknown>)[pathPart]
          : undefined,
      value,
    );
