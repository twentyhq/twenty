import { type ObjectLiteral } from 'typeorm';
import { type FeatureFlagKey } from 'twenty-shared/types';

import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { type CommonBaseQueryRunnerContext } from 'src/engine/api/common/types/common-base-query-runner-context.type';
import { type GraphqlQueryParser } from 'src/engine/api/graphql/graphql-query-runner/graphql-query-parsers/graphql-query.parser';
import { type WorkspaceRepositoryV2 } from 'src/engine/twenty-orm-v2/repository/workspace-repository-v2';
import { type RolePermissionConfig } from 'src/engine/twenty-orm/types/role-permission-config';

export type CommonExtendedQueryRunnerContext = Omit<
  CommonBaseQueryRunnerContext,
  'authContext'
> & {
  authContext: WorkspaceAuthContext;
  rolePermissionConfig: RolePermissionConfig;
  repository: WorkspaceRepositoryV2<ObjectLiteral>;
  commonQueryParser: GraphqlQueryParser;
  featureFlagsMap: Record<FeatureFlagKey, boolean>;
};
