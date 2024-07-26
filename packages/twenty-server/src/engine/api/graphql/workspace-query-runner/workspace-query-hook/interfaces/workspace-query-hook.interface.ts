import { ResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

export interface WorkspaceQueryHookInstance {
  execute(
    userId: string | undefined,
    workspaceId: string,
    objectName: string,
    payload: ResolverArgs,
  ): Promise<ResolverArgs>;
}
