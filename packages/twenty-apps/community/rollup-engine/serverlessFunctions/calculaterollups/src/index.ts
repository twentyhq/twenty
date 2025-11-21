import { computeAggregations } from './aggregations';
import { buildChildRecordIndex, TwentyClient } from './client';
import { extractRelationValues, resolveRollupConfig } from './config';
import { getNestedValue } from './filtering';
import type { ExecutionSummaryItem } from './types';
import { type ServerlessFunctionConfig } from 'twenty-sdk/application';

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const sanitizePayload = (payload: Record<string, unknown>) =>
  Object.fromEntries(
    Object.entries(payload).filter(([, value]) => {
      if (value === undefined) {
        return false;
      }
      if (typeof value === 'number' && !Number.isFinite(value)) {
        return false;
      }
      return true;
    }),
  );

const determineFullRebuild = (params: unknown) => {
  if (!isObject(params)) {
    return false;
  }
  if (params.recalculateAll === true || params.fullRebuild === true) {
    return true;
  }
  if (isObject(params.trigger) && params.trigger.type === 'cron') {
    return true;
  }
  if (params.trigger === 'cron') {
    return true;
  }
  return false;
};

const getApiCredentials = () => {
  const apiKey =
    process.env.TWENTY_API_KEY ??
    process.env.TWENTY_API_TOKEN ??
    process.env.API_KEY;

  if (!apiKey) {
    return null;
  }

  const baseUrlRaw =
    process.env.TWENTY_API_BASE_URL ??
    process.env.TWENTY_REST_BASE_URL ??
    process.env.TWENTY_API_URL ??
    '';

  const baseUrl =
    typeof baseUrlRaw === 'string' && baseUrlRaw.trim().length > 0
      ? baseUrlRaw
      : 'https://app.twenty.com/rest';

  return { apiKey, baseUrl };
};

const formatSummary = (
  summaries: ExecutionSummaryItem[],
  durationMs: number,
) => ({
  status: 'ok',
  tookMs: durationMs,
  totals: {
    processed: summaries.reduce(
      (accumulator, item) => accumulator + item.processed,
      0,
    ),
    updated: summaries.reduce(
      (accumulator, item) => accumulator + item.updated,
      0,
    ),
  },
  details: summaries,
});

export const main = async (params: unknown): Promise<any> => {
  const start = Date.now();
  try {
    const config = resolveRollupConfig();
    if (config.length === 0) {
      return { status: 'noop', reason: 'No rollup definitions configured' };
    }

    const fullRebuild = determineFullRebuild(params);
    const relationCache = new Map<string, Set<string>>();

    config.forEach((definition) => {
      if (!relationCache.has(definition.relationField)) {
        relationCache.set(
          definition.relationField,
          extractRelationValues(params, definition.relationField),
        );
      }
    });

    const credentials = getApiCredentials();
    if (!credentials) {
      console.warn(
        '[rollup] skipping execution because TWENTY_API_KEY is not set',
      );
      return { status: 'noop', reason: 'TWENTY_API_KEY not configured' };
    }

    const { apiKey, baseUrl } = credentials;
    const client = new TwentyClient(apiKey, baseUrl);
    const now = new Date();
    const summaries: ExecutionSummaryItem[] = [];

    for (const definition of config) {
      const targetIds = fullRebuild
        ? undefined
        : relationCache.get(definition.relationField);

      if (!fullRebuild && (!targetIds || targetIds.size === 0)) {
        summaries.push({
          parentObject: definition.parentObject,
          processed: 0,
          updated: 0,
          relationField: definition.relationField,
          mode: 'targeted',
          skipped: `No ${definition.relationField} values found in payload`,
        });
        continue;
      }

      const childIndex = await buildChildRecordIndex(
        definition,
        client,
        targetIds,
      );

      const updates: Array<{
        id: string;
        payload: Record<string, unknown>;
        context: { relationId: string };
      }> = [];
      childIndex.forEach((records, parentId) => {
        const recordIds = records
          .map((record) => getNestedValue(record, 'id'))
          .filter((value): value is string => typeof value === 'string');
        console.info(
          `[rollup] relation ${parentId} includes ${recordIds.length} ${definition.childObject}(s): ${recordIds.join(', ')}`,
        );
        const aggregates = computeAggregations(definition, records, now);
        const payload = sanitizePayload(aggregates);
        if (Object.keys(payload).length === 0) {
          return;
        }
        console.info(
          `[rollup] computed aggregates for ${definition.parentObject} ${parentId}: ${JSON.stringify(payload)}`,
        );
        updates.push({
          id: parentId,
          payload,
          context: { relationId: parentId },
        });
      });

      let updatedCount = 0;
      for (const update of updates) {
        try {
          await client.updateObject(
            definition.parentObject,
            update.id,
            update.payload,
          );
          updatedCount += 1;
          console.info(
            `[rollup] updated ${definition.parentObject} ${update.id} (relation ${update.context.relationId})`,
          );
        } catch (error) {
          const reason =
            error instanceof Error
              ? error.message || error.toString()
              : typeof error === 'string'
                ? error
                : 'Unknown error';
          console.warn(
            `[rollup] failed to update ${definition.parentObject} ${update.id} (relation ${update.context.relationId}): ${reason}`,
          );
        }
      }

      summaries.push({
        parentObject: definition.parentObject,
        processed: childIndex.size,
        updated: updatedCount,
        relationField: definition.relationField,
        mode: fullRebuild ? 'full-rebuild' : 'targeted',
      });
    }

    const totalProcessed = summaries.reduce(
      (accumulator, item) => accumulator + item.processed,
      0,
    );

    if (!fullRebuild && totalProcessed === 0) {
      return {
        status: 'noop',
        reason: 'No matching relation ids found in payload',
      };
    }

    const duration = Date.now() - start;
    console.info(
      `[rollup] completed mode=${fullRebuild ? 'full-rebuild' : 'targeted'} processed=${totalProcessed} durationMs=${duration}`,
    );
    return formatSummary(summaries, duration);
  } catch (error) {
    const serializedError =
      error instanceof Error
        ? `${error.name}: ${error.message}${error.stack ? `\n${error.stack}` : ''}`
        : JSON.stringify(error);
    console.error('[rollup] execution failed', serializedError);
    return {
      status: 'error',
      message:
        error instanceof Error
          ? error.message || 'Unknown error'
          : typeof error === 'string'
            ? error
            : 'Unknown error',
    };
  }
};

export const config: ServerlessFunctionConfig = {
  universalIdentifier: 'c3ec36c8-5b1d-421f-9172-a9e035ab9c18',
  name: 'calculaterollups',
  triggers: [
    {
      universalIdentifier: 'eec8aaf2-b0cc-47fd-b522-8d4aa5fe4bd3',
      type: 'databaseEvent',
      eventName: 'opportunity.*',
    },
    {
      universalIdentifier: 'a3fea230-1121-44a6-b395-5811c3031f8e',
      type: 'cron',
      pattern: ' 0 2 * * *',
    },
    {
      universalIdentifier: 'd33b0fe4-4b2b-45c0-aa2f-e617fdbba484',
      type: 'route',
      path: '/recalculate-all',
      httpMethod: 'POST',
      isAuthRequired: true,
    },
  ],
};
