import {
  AutoResolverOpts,
  PagingStrategies,
  ReadResolverOpts,
} from '@ptc-org/nestjs-query-graphql';

import { JwtAuthGuard } from 'src/engine/guards/jwt.auth.guard';
import { UpdateWorkspaceInput } from 'src/engine/core-modules/workspace/dtos/update-workspace-input';

import { Workspace } from './workspace.entity';

export const workspaceAutoResolverOpts: AutoResolverOpts<
  any,
  any,
  unknown,
  unknown,
  ReadResolverOpts<any>,
  PagingStrategies
>[] = [
  {
    EntityClass: Workspace,
    DTOClass: Workspace,
    UpdateDTOClass: UpdateWorkspaceInput,
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
      one: { disabled: true },
      many: { disabled: true },
    },
    delete: { many: { disabled: true }, one: { disabled: true } },
    guards: [JwtAuthGuard],
  },
];
