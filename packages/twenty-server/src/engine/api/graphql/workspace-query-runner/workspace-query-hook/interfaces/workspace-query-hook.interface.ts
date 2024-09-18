import { ResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import { AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';

export interface WorkspaceQueryHookInstance {
  execute(
    authContext: AuthContext,
    objectName: string,
    payload: ResolverArgs,
  ): Promise<ResolverArgs>;
}

export interface WorkspaceQueryPostHookInstance {
  execute(
    authContext: AuthContext,
    objectName: string,
    payload: unknown[],
  ): Promise<void>;
}
