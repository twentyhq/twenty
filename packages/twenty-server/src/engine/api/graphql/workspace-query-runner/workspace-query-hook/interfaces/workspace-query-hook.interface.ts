import { type QueryResultFieldValue } from 'src/engine/api/graphql/workspace-query-runner/factories/query-result-getters/interfaces/query-result-field-value';
import { type ResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import { type AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';

export interface WorkspacePreQueryHookInstance {
  execute(
    authContext: AuthContext,
    objectName: string,
    payload: ResolverArgs,
  ): Promise<ResolverArgs>;
}

export interface WorkspacePostQueryHookInstance {
  execute(
    authContext: AuthContext,
    objectName: string,
    payload: QueryResultFieldValue,
  ): Promise<void>;
}
