import type { TwentyClientLike } from '../supabase-sync/types/twenty-client-like.type';
import { extractConnection } from '../supabase-sync/utils/extract-twenty-result';
import type { FulfillmentExceptionSummary } from './partner-api-client';
import type { CursorStep } from './partner-cursor-service';
import { getWatermark, saveCursor } from './partner-cursor-service';
import { mapPartnerAmbassador, mapPartnerOrder, mapPartnerShipment } from './map-partner-record';
import { enrichTwentyRecord } from './enrich-twenty-record';

export type PartnerApiClientType = {
  fetchShipments: (updatedSince?: string) => Promise<Record<string, unknown>[]>;
  fetchOrders: (updatedSince?: string) => Promise<Record<string, unknown>[]>;
  fetchAmbassadors: () => Promise<Record<string, unknown>[]>;
  fetchFulfillmentExceptions: (days?: number) => Promise<FulfillmentExceptionSummary>;
};

export type EndpointName = 'orders' | 'shipments' | 'ambassadors';

export type EnrichmentEndpointResult = {
  endpoint: EndpointName;
  scanned: number;
  enriched: number;
  skipped: number;
  failed: number;
  errors: string[];
  watermark: string | null;
  durationMs: number;
};

export type PartnerEnrichmentInput = {
  apiClient: PartnerApiClientType;
  twentyClient: TwentyClientLike;
  endpoints?: EndpointName[];
  dryRun?: boolean;
};

export type PartnerEnrichmentResult = {
  dryRun: boolean;
  results: EnrichmentEndpointResult[];
  fulfillmentExceptions: FulfillmentExceptionSummary | null;
  totalDurationMs: number;
};

const DEFAULT_ENDPOINT_ORDER: EndpointName[] = ['orders', 'shipments', 'ambassadors'];

const stringValue = (value: unknown): string | undefined =>
  typeof value === 'string' && value.length > 0 ? value : undefined;

const numberValue = (value: unknown): number | undefined =>
  typeof value === 'number' && Number.isFinite(value) ? value : undefined;

const extractWatermark = (rows: Record<string, unknown>[], field: string): string | null => {
  let max: string | null = null;
  for (const row of rows) {
    const value = stringValue(row[field]);
    if (value && (!max || value > max)) max = value;
  }
  return max;
};

const findOrderByFuzzyMatch = async (
  client: TwentyClientLike,
  row: Record<string, unknown>,
): Promise<{ id: string } | null> => {
  const totalCents = numberValue(row.total_cents);
  const orderedAt = stringValue(row.created_at);
  if (totalCents === undefined || !orderedAt) return null;

  const result = await client.query({
    xopureOrders: {
      __args: { filter: { totalCents: { eq: totalCents }, orderedAt: { eq: orderedAt } }, first: 1 },
      edges: { node: { id: true } },
    },
  });

  const connection = extractConnection<{ id: string }>(result, 'xopureOrders');
  return connection.edges[0]?.node ?? null;
};

const runEndpoint = async (
  input: PartnerEnrichmentInput,
  endpoint: EndpointName,
): Promise<EnrichmentEndpointResult> => {
  const startTime = Date.now();
  let step: CursorStep | null = null;
  let rows: Record<string, unknown>[] = [];
  let watermarkField: string | null = null;

  if (endpoint === 'orders') {
    step = 'partner-orders';
    watermarkField = 'created_at';
    const watermark = input.dryRun ? undefined : await getWatermark(input.twentyClient, step);
    rows = await input.apiClient.fetchOrders(watermark);
  } else if (endpoint === 'shipments') {
    step = 'partner-shipments';
    watermarkField = 'shiphero_synced_at';
    const watermark = input.dryRun ? undefined : await getWatermark(input.twentyClient, step);
    rows = await input.apiClient.fetchShipments(watermark);
  } else {
    rows = await input.apiClient.fetchAmbassadors();
  }

  const newWatermark = watermarkField ? extractWatermark(rows, watermarkField) : null;
  let scanned = 0;
  let enriched = 0;
  let skipped = 0;
  let failed = 0;
  const errors: string[] = [];

  for (const row of rows) {
    scanned += 1;
    const mappingResult =
      endpoint === 'orders' ? mapPartnerOrder(row) :
      endpoint === 'shipments' ? mapPartnerShipment(row) :
      mapPartnerAmbassador(row);

    if (!mappingResult.ok) {
      failed += 1;
      errors.push(mappingResult.message);
      continue;
    }

    if (input.dryRun) {
      skipped += 1;
      continue;
    }

    try {
      const fallback = endpoint === 'orders'
        ? () => findOrderByFuzzyMatch(input.twentyClient, row)
        : undefined;
      const result = await enrichTwentyRecord(input.twentyClient, mappingResult.record, fallback);
      if (result.action === 'updated') enriched += 1;
      else skipped += 1;
    } catch (err) {
      failed += 1;
      errors.push(err instanceof Error ? err.message : String(err));
    }
  }

  if (!input.dryRun && step) {
    await saveCursor(input.twentyClient, step, newWatermark, 'OK');
  }

  return { endpoint, scanned, enriched, skipped, failed, errors, watermark: newWatermark, durationMs: Date.now() - startTime };
};

export const runPartnerEnrichment = async (
  input: PartnerEnrichmentInput,
): Promise<PartnerEnrichmentResult> => {
  const startTime = Date.now();
  const dryRun = input.dryRun !== false;
  const endpoints = input.endpoints ?? DEFAULT_ENDPOINT_ORDER;
  const results: EnrichmentEndpointResult[] = [];
  let fulfillmentExceptions: FulfillmentExceptionSummary | null = null;

  for (const endpoint of endpoints) {
    const result = await runEndpoint(input, endpoint);
    results.push(result);
  }

  try {
    fulfillmentExceptions = await input.apiClient.fetchFulfillmentExceptions();
  } catch {
    // Non-critical: fulfillment exceptions are monitoring-only
  }

  return { dryRun, results, fulfillmentExceptions, totalDurationMs: Date.now() - startTime };
};
