import { type AiRunScope } from 'twenty-shared/ai';

export type ExplicitObjectGrants =
  | { type: 'role'; roleId: string }
  | { type: 'scope'; scope: AiRunScope };
