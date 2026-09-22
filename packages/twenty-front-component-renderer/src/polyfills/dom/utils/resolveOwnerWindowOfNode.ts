import { toGlobalScopeRecord } from '@/polyfills/utils/toGlobalScopeRecord';

type NodeWithOwnerDocument = {
  ownerDocument?: { defaultView?: object | null } | null;
};

export const resolveOwnerWindowOfNode = (
  node: object,
): Record<string, unknown> =>
  toGlobalScopeRecord(
    (node as NodeWithOwnerDocument).ownerDocument?.defaultView ?? globalThis,
  );
