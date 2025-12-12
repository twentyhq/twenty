import { type ObjectLiteral } from 'typeorm';

import { type WorkspaceAuthContext } from 'src/engine/api/common/interfaces/workspace-auth-context.interface';

import { type CommonBaseQueryRunnerContext } from 'src/engine/api/common/types/common-base-query-runner-context.type';
import { type GraphqlQueryParser } from 'src/engine/api/graphql/graphql-query-runner/graphql-query-parsers/graphql-query.parser';
import { type GlobalWorkspaceDataSource } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-datasource';
import { type WorkspaceRepository } from 'src/engine/twenty-orm/repository/workspace.repository';
import { type RolePermissionConfig } from 'src/engine/twenty-orm/types/role-permission-config';

export type CommonExtendedQueryRunnerContext = Omit<
  CommonBaseQueryRunnerContext,
  'authContext'
> & {
  authContext: WorkspaceAuthContext;
  rolePermissionConfig: RolePermissionConfig;
  repository: WorkspaceRepository<ObjectLiteral>;
  commonQueryParser: GraphqlQueryParser;
  workspaceDataSource: GlobalWorkspaceDataSource;
};
