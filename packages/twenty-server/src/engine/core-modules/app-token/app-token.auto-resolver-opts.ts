import {
  AutoResolverOpts,
  PagingStrategies,
  ReadResolverOpts,
} from '@ptc-org/nestjs-query-graphql';

import { AppToken } from 'src/engine/core-modules/app-token/app-token.entity';
import { CreateAppTokenInput } from 'src/engine/core-modules/app-token/dtos/create-app-token.input';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';

export const appTokenAutoResolverOpts: AutoResolverOpts<
  any,
  any,
  unknown,
  unknown,
  ReadResolverOpts<any>,
  PagingStrategies
>[] = [
  {
    EntityClass: AppToken,
    DTOClass: AppToken,
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
