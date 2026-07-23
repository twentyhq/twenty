import { Injectable } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { InjectCacheStorage } from 'src/engine/core-modules/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { type AgentEntity } from 'src/engine/metadata-modules/ai/ai-agent/entities/agent.entity';

const MAX_PRELOAD_TOOL_NAMES = 12;
// Aligned with the model's ephemeral prompt-cache window and slid on each read,
// so a frequently-run agent keeps a stable warm set while an idle one expires.
const AGENT_TOOL_PRELOAD_TTL_MS = 1000 * 60 * 5;

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
    const cacheKey = this.buildCacheKey(agent);
    const storedToolNames =
      await this.cacheStorageService.get<string[]>(cacheKey);

    if (!isDefined(storedToolNames)) {
      return [];
    }

    // Slide the TTL: consuming the set keeps it (and the model's prompt cache)
    // alive for agents that run within the window.
    await this.cacheStorageService.set(
      cacheKey,
      storedToolNames,
      AGENT_TOOL_PRELOAD_TTL_MS,
    );

    return storedToolNames;
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

  // Keyed by updatedAt so editing the agent (prompt, permissions, config)
  // abandons the old learned set and relearns from scratch.
  private buildCacheKey(agent: AgentToolPreloadKey): string {
    return `${agent.id}:${new Date(agent.updatedAt).getTime()}`;
  }
}
