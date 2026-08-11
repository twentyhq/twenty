import { type ObjectLiteral } from 'typeorm';

import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { type CommonBaseQueryRunnerContext } from 'src/engine/api/common/types/common-base-query-runner-context.type';
import { type GraphqlQueryParser } from 'src/engine/api/graphql/graphql-query-runner/graphql-query-parsers/graphql-query.parser';
import { type GlobalWorkspaceDataSource } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-datasource';
import { type WorkspaceRepository } from 'src/engine/twenty-orm/repository/workspace.repository';
import { type RolePermissionConfig } from 'src/engine/twenty-orm/types/role-permission-config';
import { type WorkspaceRepositoryV2 } from 'src/engine/twenty-orm-v2/repository/workspace-repository-v2';

export type CommonExtendedQueryRunnerContext = Omit<
  CommonBaseQueryRunnerContext,
  'authContext'
> & {
  authContext: WorkspaceAuthContext;
  rolePermissionConfig: RolePermissionConfig;
  repository: WorkspaceRepository<ObjectLiteral>;
  commonQueryParser: GraphqlQueryParser;
  workspaceDataSource: GlobalWorkspaceDataSource;
  // Set only when IS_ORM_V2_READ_PATH_ENABLED is on and the runner is read-only.
  // Runners that have a v2 path use it; the rest keep using `repository`.
  readRepositoryV2?: WorkspaceRepositoryV2;
};
