import { type CoreApiClient } from 'twenty-client-sdk/core';

import { type BulkEnrichInput } from 'src/types/bulk-enrich-input';
import { type CompanyIdByMatchKeyCache } from 'src/types/company-id-by-match-key-cache';
import { type PdlEnrichResult } from 'src/types/pdl-enrich-result';

export type BatchEnrichmentAdapter<TNode, TData, TParams> = {
  objectNameSingular: string;
  noIdentifierMessage: string;
  costPerMatchDollars: number;
  readRecords: (args: {
    client: CoreApiClient;
    recordIds: string[];
  }) => Promise<TNode[]>;
  getNodeId: (node: TNode) => string;
  extractParams: (args: {
    node: TNode;
    input: BulkEnrichInput;
  }) => TParams | undefined;
  enrichBatch: (params: TParams[]) => Promise<PdlEnrichResult<TData>[]>;
  buildMatchedData: (args: {
    client: CoreApiClient;
    node: TNode;
    outcome: { likelihood?: number; data: TData };
    enrichedAt: string;
    companyIdByMatchKeyCache: CompanyIdByMatchKeyCache;
    overrideExistingValues: boolean;
  }) => Promise<Record<string, unknown>>;
  updateOne: (args: {
    client: CoreApiClient;
    recordId: string;
    data: Record<string, unknown>;
  }) => Promise<void>;
  updateManyStatus: (args: {
    client: CoreApiClient;
    recordIds: string[];
    data: Record<string, unknown>;
  }) => Promise<void>;
};
