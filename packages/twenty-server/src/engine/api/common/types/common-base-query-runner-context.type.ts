import { type ObjectLiteral } from 'typeorm';

import { type CommonQueryRunnerOptions } from 'src/engine/api/common/interfaces/common-query-runner-options.interface';
import { type ResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import { type CommonSelectedFieldsResult } from 'src/engine/api/common/types/common-selected-fields-result.type';
import { type WorkspaceDataSource } from 'src/engine/twenty-orm/datasource/workspace.datasource';
import { type WorkspaceRepository } from 'src/engine/twenty-orm/repository/workspace.repository';

export type CommonBaseQueryRunnerContext<Input extends ResolverArgs> = {
  args: Input;
  options: CommonQueryRunnerOptions;
  workspaceDataSource: WorkspaceDataSource;
  repository: WorkspaceRepository<ObjectLiteral>;
  selectedFieldsResult: CommonSelectedFieldsResult;
  isExecutedByApiKey: boolean;
  roleId?: string;
  shouldBypassPermissionChecks: boolean;
};
