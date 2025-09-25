import { type GraphQLResolveInfo } from 'graphql';

import { type CommonQueryRunnerOptions } from 'src/engine/api/common/interfaces/common-query-runner-options.interface';

export interface WorkspaceQueryRunnerOptions extends CommonQueryRunnerOptions {
  info: GraphQLResolveInfo;
}
