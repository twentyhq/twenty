import { type FeatureFlagKey, type ObjectRecord } from 'twenty-shared/types';

import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { type CommonBaseQueryRunnerContext } from 'src/engine/api/common/types/common-base-query-runner-context.type';
import { type GraphqlQueryParser } from 'src/engine/api/graphql/graphql-query-runner/graphql-query-parsers/graphql-query.parser';
import { type WorkspaceRepository } from 'src/engine/twenty-orm/repository/workspace-repository';

export type CommonExtendedQueryRunnerContext = Omit<
  CommonBaseQueryRunnerContext,
  'authContext'
> & {
  authContext: WorkspaceAuthContext;
  repository: WorkspaceRepository<ObjectRecord>;
  commonQueryParser: GraphqlQueryParser;
  featureFlagsMap: Record<FeatureFlagKey, boolean>;
};
