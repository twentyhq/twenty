import {
  type AutoResolverOpts,
  PagingStrategies,
  type ReadResolverOpts,
} from '@ptc-org/nestjs-query-graphql';

import { AppTokenEntity } from 'src/engine/core-modules/app-token/app-token.entity';
import { CreateAppTokenInput } from 'src/engine/core-modules/app-token/dtos/create-app-token.input';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';

export const appTokenAutoResolverOpts: AutoResolverOpts<
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
    EntityClass: AppTokenEntity,
    DTOClass: AppTokenEntity,
    CreateDTOClass: CreateAppTokenInput,
    enableTotalCount: true,
    pagingStrategy: PagingStrategies.CURSOR,
    read: {
      many: { disabled: true },
      one: { disabled: true },
    },
    create: {
      many: { disabled: true },
    },
    update: {
      many: { disabled: true },
      one: { disabled: true },
    },
    delete: { many: { disabled: true }, one: { disabled: true } },
    guards: [WorkspaceAuthGuard],
  },
];
