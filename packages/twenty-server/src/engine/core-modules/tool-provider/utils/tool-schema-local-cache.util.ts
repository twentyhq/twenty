import { isDefined } from 'twenty-shared/utils';

type ToolSchemaLocalCacheEntry = {
  metadataVersion: string;
  schemaByKey: Map<string, object | null>;
  sizeBytes: number;
  lastUsedAt: number;
};

export type ToolSchemaStore = {
  getOrCompute: (key: string, compute: () => object | null) => object | null;
};

// In-process LRU of generated tool input schemas, one entry per workspace metadata version.
// Bounded by the serialized size of the schemas it holds, since one large workspace can weigh several MB.
export class ToolSchemaLocalCache {
  private readonly entryByWorkspaceId = new Map<
    string,
    ToolSchemaLocalCacheEntry
  >();
  private totalSizeBytes = 0;

  constructor(
    private readonly options: {
      maxSizeBytes: number;
      idleTtlMs: number;
      now?: () => number;
    },
  ) {}

  getStore(workspaceId: string, metadataVersion: string): ToolSchemaStore {
    const entry = this.touchEntry(workspaceId, metadataVersion);

    return {
      getOrCompute: (key, compute) => {
        if (entry.schemaByKey.has(key)) {
          return entry.schemaByKey.get(key) ?? null;
        }

        const schema = compute();
        const sizeBytes = isDefined(schema) ? JSON.stringify(schema).length : 0;

        entry.schemaByKey.set(key, schema);

        if (this.entryByWorkspaceId.get(workspaceId) === entry) {
          entry.sizeBytes += sizeBytes;
          this.totalSizeBytes += sizeBytes;
          this.evictIfNeeded(workspaceId);
        }

        return schema;
      },
    };
  }

  get sizeBytes(): number {
    return this.totalSizeBytes;
  }

  get workspaceCount(): number {
    return this.entryByWorkspaceId.size;
  }

  private touchEntry(
    workspaceId: string,
    metadataVersion: string,
  ): ToolSchemaLocalCacheEntry {
    const now = this.now();

    this.evictIdleEntries(now);

    const existingEntry = this.entryByWorkspaceId.get(workspaceId);

    if (isDefined(existingEntry)) {
      this.deleteEntry(workspaceId);
    }

    const entry =
      existingEntry?.metadataVersion === metadataVersion
        ? existingEntry
        : {
            metadataVersion,
            schemaByKey: new Map<string, object | null>(),
            sizeBytes: 0,
            lastUsedAt: now,
          };

    entry.lastUsedAt = now;
    this.entryByWorkspaceId.set(workspaceId, entry);
    this.totalSizeBytes += entry.sizeBytes;

    return entry;
  }

  private evictIdleEntries(now: number): void {
    for (const [workspaceId, entry] of this.entryByWorkspaceId) {
      if (now - entry.lastUsedAt <= this.options.idleTtlMs) {
        // Map iteration follows recency, so every following entry is fresher
        return;
      }

      this.deleteEntry(workspaceId);
    }
  }

  private evictIfNeeded(protectedWorkspaceId: string): void {
    for (const workspaceId of this.entryByWorkspaceId.keys()) {
      if (this.totalSizeBytes <= this.options.maxSizeBytes) {
        return;
      }

      if (workspaceId !== protectedWorkspaceId) {
        this.deleteEntry(workspaceId);
      }
    }
  }

  private deleteEntry(workspaceId: string): void {
    const entry = this.entryByWorkspaceId.get(workspaceId);

    if (!isDefined(entry)) {
      return;
    }

    this.totalSizeBytes -= entry.sizeBytes;
    this.entryByWorkspaceId.delete(workspaceId);
  }

  private now(): number {
    return this.options.now?.() ?? Date.now();
  }
}
