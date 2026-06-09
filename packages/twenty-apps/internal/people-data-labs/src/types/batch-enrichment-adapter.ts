import { type CoreApiClient } from 'twenty-client-sdk/core';

import { type BulkEnrichInput } from 'src/types/bulk-enrich-input';
import { type PdlEnrichResult } from 'src/types/pdl-enrich-result';

export type BatchEnrichmentAdapter<TNode, TData, TParams> = {
  objectNameSingular: string;
  noIdentifierMessage: string;
  readRecords: (client: CoreApiClient, recordIds: string[]) => Promise<TNode[]>;
  getNodeId: (node: TNode) => string;
  getLastEnrichedAt: (node: TNode) => string | null | undefined;
  extractParams: (node: TNode, input: BulkEnrichInput) => TParams | undefined;
  enrichBatch: (params: TParams[]) => Promise<PdlEnrichResult<TData>[]>;
  buildMatchedData: (
    client: CoreApiClient,
    node: TNode,
    outcome: { likelihood?: number; data: TData },
    enrichedAt: string,
  ) => Promise<Record<string, unknown>>;
  updateOne: (
    client: CoreApiClient,
    recordId: string,
    data: Record<string, unknown>,
  ) => Promise<void>;
  updateManyStatus: (
    client: CoreApiClient,
    recordIds: string[],
    data: Record<string, unknown>,
  ) => Promise<void>;
};
