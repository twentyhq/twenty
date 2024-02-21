import {
  AutoResolverOpts,
  ReadResolverOpts,
  PagingStrategies,
} from '@ptc-org/nestjs-query-graphql';

import { UserWorkspace } from 'src/core/user-workspace/user-workspace.entity';

export const userWorkspaceAutoResolverOpts: AutoResolverOpts<
  any,
  any,
  unknown,
  unknown,
  ReadResolverOpts<any>,
  PagingStrategies
>[] = [
  {
    EntityClass: UserWorkspace,
    DTOClass: UserWorkspace,
    enableTotalCount: true,
    pagingStrategy: PagingStrategies.CURSOR,
  },
];
