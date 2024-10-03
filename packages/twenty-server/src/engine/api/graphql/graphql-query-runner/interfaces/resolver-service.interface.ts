import { WorkspaceQueryRunnerOptions } from 'src/engine/api/graphql/workspace-query-runner/interfaces/query-runner-option.interface';

export interface ResolverService<ResolverArgs, T> {
  resolve: (
    args: ResolverArgs,
    options: WorkspaceQueryRunnerOptions,
  ) => Promise<T>;
  validate: (
    args: ResolverArgs,
    options: WorkspaceQueryRunnerOptions,
  ) => Promise<void>;
}
