import {
  AutoResolverOpts,
  PagingStrategies,
  ReadResolverOpts,
} from '@ptc-org/nestjs-query-graphql';

import { User } from 'src/engine/core-modules/user/user.entity';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';

export const userAutoResolverOpts: AutoResolverOpts<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  any,
  unknown,
  unknown,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ReadResolverOpts<any>,
  PagingStrategies
>[] = [
  {
    EntityClass: User,
    DTOClass: User,
    enableTotalCount: true,
    pagingStrategy: PagingStrategies.CURSOR,
    read: {
      many: { disabled: true },
      one: { disabled: true },
    },
    create: {
      many: { disabled: true },
      one: { disabled: true },
    },
    update: {
      many: { disabled: true },
      one: { disabled: true },
    },
    delete: { many: { disabled: true }, one: { disabled: true } },
    guards: [WorkspaceAuthGuard],
  },
];
