import {
    AutoResolverOpts,
    PagingStrategies,
    ReadResolverOpts,
} from '@ptc-org/nestjs-query-graphql';

import { AiAgentConfig } from 'src/engine/core-modules/ai-agent-config/ai-agent-config.entity';
import { CreateAiAgentConfigInput } from 'src/engine/core-modules/ai-agent-config/dtos/create-ai-agent-config.input';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';

export const aiAgentConfigAutoResolverOpts: AutoResolverOpts<
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
    EntityClass: AiAgentConfig,
    DTOClass: AiAgentConfig,
    CreateDTOClass: CreateAiAgentConfigInput,
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