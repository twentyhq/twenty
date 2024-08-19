import {
  AutoResolverOpts,
  ReadResolverOpts,
  PagingStrategies,
} from '@ptc-org/nestjs-query-graphql';

import { JwtAuthGuard } from 'src/engine/guards/jwt.auth.guard';
import { Invitation } from 'src/engine/core-modules/invitation/invitation.entity';

export const invitationAutoResolverOpts: AutoResolverOpts<
  any,
  any,
  unknown,
  unknown,
  ReadResolverOpts<any>,
  PagingStrategies
>[] = [
  {
    EntityClass: Invitation,
    DTOClass: Invitation,
    enableTotalCount: true,
    // For a unknown reason PagingStrategies.CURSOR is not working. It a global type error in the navigator
    pagingStrategy: PagingStrategies.NONE,
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
    guards: [JwtAuthGuard],
  },
];
