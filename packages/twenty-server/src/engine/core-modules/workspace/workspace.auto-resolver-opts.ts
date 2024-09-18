import {
  AutoResolverOpts,
  PagingStrategies,
  ReadResolverOpts,
} from '@ptc-org/nestjs-query-graphql';

import { UpdateWorkspaceInput } from 'src/engine/core-modules/workspace/dtos/update-workspace-input';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';

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
    guards: [WorkspaceAuthGuard],
  },
];
