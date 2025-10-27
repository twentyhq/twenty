import {
  type AutoResolverOpts,
  PagingStrategies,
  type ReadResolverOpts,
} from '@ptc-org/nestjs-query-graphql';

import { UpdateWorkspaceInput } from 'src/engine/core-modules/workspace/dtos/update-workspace-input';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';

export const workspaceAutoResolverOpts: AutoResolverOpts<
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
    EntityClass: WorkspaceEntity,
    DTOClass: WorkspaceEntity,
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
