import {
  defineLogicFunction,
  type RoutePayload,
} from 'twenty-sdk/define';

import { runAppFactoryPipeline } from '../app-factory/core/pipeline';

type AppFactoryRouteRequest = {
  spec?: unknown;
  cwd?: string;
  dryRun?: boolean;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const parseRequestBody = (body: unknown): AppFactoryRouteRequest => {
  if (typeof body === 'string') {
    try {
      const parsed = JSON.parse(body);
      return isRecord(parsed) ? (parsed as AppFactoryRouteRequest) : {};
    } catch {
      return {};
    }
  }

  if (isRecord(body)) {
    return body as AppFactoryRouteRequest;
  }

  return {};
};

const applyDryRunOverride = (spec: unknown, dryRun?: boolean): unknown => {
  if (dryRun === undefined || !isRecord(spec)) {
    return spec;
  }

  const existingPipeline = isRecord(spec.pipeline) ? spec.pipeline : {};

  return {
    ...spec,
    pipeline: {
      ...existingPipeline,
      dryRun,
    },
  };
};

const handler = async (event: RoutePayload) => {
  if (process.env.XOPURE_APP_FACTORY_ENABLED !== 'true') {
    return {
      statusCode: 403,
      body: {
        ok: false,
        error:
          'App factory is disabled. Set XOPURE_APP_FACTORY_ENABLED=true to enable this route.',
      },
    };
  }

  const request = parseRequestBody(event.body);

  if (!request.spec) {
    return {
      statusCode: 400,
      body: {
        ok: false,
        error: 'Request body must include `spec`.',
      },
    };
  }

  const specWithOverrides = applyDryRunOverride(request.spec, request.dryRun);
  const result = runAppFactoryPipeline(specWithOverrides, {
    cwd: request.cwd,
  });

  return {
    statusCode: result.success ? 200 : 422,
    body: {
      ok: result.success,
      result,
    },
  };
};

export default defineLogicFunction({
  universalIdentifier: '640f9f5b-1b3b-4d03-a02b-4c8a001cbfc7',
  name: 'xopure-app-factory-orchestrator',
  description:
    'Orchestrates app scaffold, generation, build, deploy, and install from a typed app-factory spec.',
  timeoutSeconds: 90,
  handler,
  httpRouteTriggerSettings: {
    path: '/xopure/app-factory/orchestrate',
    httpMethod: 'POST',
    isAuthRequired: true,
  },
});
