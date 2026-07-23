import { Injectable } from '@nestjs/common';

import { isNonEmptyString } from 'twenty-shared/utils';

import { InjectCacheStorage } from 'src/engine/core-modules/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { type AgentEntity } from 'src/engine/metadata-modules/ai/ai-agent/entities/agent.entity';

const MAX_PRELOAD_TOOL_NAMES = 12;
const AGENT_TOOL_PRELOAD_TTL_MS = 1000 * 60 * 60 * 24;

type AgentToolPreloadKey = Pick<AgentEntity, 'id' | 'updatedAt'>;

// Remembers which registry tools a workflow agent actually used, so future runs
// can preload their schemas directly instead of paying a learn_tools round-trip
// for the tools the agent relies on every time.
@Injectable()
export class AgentToolPreloadService {
  constructor(
    @InjectCacheStorage(CacheStorageNamespace.EngineAiAgentToolPreload)
    private readonly cacheStorageService: CacheStorageService,
  ) {}

  async getPreloadToolNames(agent: AgentToolPreloadKey): Promise<string[]> {
    const storedToolNames = await this.cacheStorageService.get<string[]>(
      this.buildCacheKey(agent),
    );

    return storedToolNames ?? [];
  }

  async recordToolUsage(
    agent: AgentToolPreloadKey,
    usedToolNames: string[],
  ): Promise<void> {
    const normalizedToolNames = usedToolNames.filter(isNonEmptyString);

    if (normalizedToolNames.length === 0) {
      return;
    }

    const existingToolNames = await this.getPreloadToolNames(agent);

    // Sorted so the preloaded set serializes to stable bytes across runs, which
    // keeps the model's prompt cache warm.
    const mergedToolNames = [
      ...new Set([...existingToolNames, ...normalizedToolNames]),
    ]
      .sort()
      .slice(0, MAX_PRELOAD_TOOL_NAMES);

    await this.cacheStorageService.set(
      this.buildCacheKey(agent),
      mergedToolNames,
      AGENT_TOOL_PRELOAD_TTL_MS,
    );
  }

  private buildCacheKey(agent: AgentToolPreloadKey): string {
    return agent.id;
  }
}
