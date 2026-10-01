import { type NodeWithOwnerDocument } from '@/polyfills/dom/types/NodeWithOwnerDocument';
import { toGlobalScopeRecord } from '@/polyfills/utils/toGlobalScopeRecord';

export const resolveOwnerWindowOfNode = (
  node: NodeWithOwnerDocument,
): Record<string, unknown> =>
  toGlobalScopeRecord(node.ownerDocument?.defaultView ?? globalThis);
