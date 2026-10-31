import { type AiRunScope } from 'twenty-shared/ai';

// database tools then only cover the objects these grants name
export type ExplicitObjectGrants =
  | { type: 'role'; roleId: string }
  | { type: 'scope'; scope: AiRunScope };
