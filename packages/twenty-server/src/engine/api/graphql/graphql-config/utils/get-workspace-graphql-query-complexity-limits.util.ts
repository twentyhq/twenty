import { type GraphqlQueryComplexityLimits } from 'src/engine/core-modules/graphql/utils/validate-graphql-query-complexity-or-throw.util';
import { type TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

export const getWorkspaceGraphqlQueryComplexityLimits = (
  twentyConfigService: TwentyConfigService,
): GraphqlQueryComplexityLimits => ({
  maximumAllowedFields: twentyConfigService.get('GRAPHQL_MAX_FIELDS'),
  maximumAllowedRootResolvers: twentyConfigService.get(
    'GRAPHQL_MAX_ROOT_RESOLVERS',
  ),
  shouldCheckDuplicateRootResolvers: true,
});
