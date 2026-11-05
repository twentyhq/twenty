import { isObject } from '@sniptt/guards';
import { type RoutePayload } from 'twenty-sdk/define';

import { type BulkEnrichInput } from 'src/types/bulk-enrich-input';

type EnrichRouteBody = { recordIds?: string[] };

export type EnrichInput = BulkEnrichInput | RoutePayload<EnrichRouteBody>;

const isRoutePayload = (input: EnrichInput): input is RoutePayload<EnrichRouteBody> =>
  isObject(input) && 'requestContext' in input;

export const toBulkEnrichInput = (input: EnrichInput): BulkEnrichInput =>
  isRoutePayload(input) ? { records: input.body?.recordIds ?? [] } : input;
