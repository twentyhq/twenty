import { type GranolaWebhookScope } from 'src/logic-functions/types/granola-api.type';

export type GranolaKeyType = 'workspace' | 'personal';

export const getGranolaKeyType = (
  scopes: GranolaWebhookScope[],
): GranolaKeyType => (scopes.includes('workspace') ? 'workspace' : 'personal');
