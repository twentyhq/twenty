import { ResolverArgs } from 'src/engine/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

export interface WorkspacePreQueryHook {
  execute(
    userId: string | undefined,
    workspaceId: string,
    payload: ResolverArgs,
  ): Promise<void>;
}
