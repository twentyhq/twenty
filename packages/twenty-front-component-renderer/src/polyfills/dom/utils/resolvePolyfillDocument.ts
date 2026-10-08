import { isObject } from '@sniptt/guards';

export const resolvePolyfillDocument = (
  installTargets: Record<string, unknown>[],
): Record<string, unknown> | null => {
  for (const installTarget of installTargets) {
    const documentTarget = installTarget.document;

    if (isObject(documentTarget)) {
      return documentTarget as Record<string, unknown>;
    }
  }

  return null;
};
