import { type Request } from 'express';
import { type IngressTriggerSettings } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { extractBody } from 'src/engine/core-modules/logic-function/logic-function-trigger/triggers/route/utils/build-logic-function-event.util';

const SAFE_PATH_SEGMENT = /^[A-Za-z0-9_-]+$/;
const FORBIDDEN_PATH_SEGMENTS = new Set([
  '__proto__',
  'prototype',
  'constructor',
]);

const asRecord = (value: unknown): Record<string, unknown> | undefined =>
  typeof value === 'object' && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : undefined;

const asString = (value: unknown): string | undefined => {
  if (typeof value === 'string' && value.length > 0) {
    return value;
  }

  if (Array.isArray(value)) {
    const first = value[0];

    return typeof first === 'string' && first.length > 0 ? first : undefined;
  }

  return undefined;
};

const getResolverRoot = (
  source: IngressTriggerSettings['workspaceId']['source'],
  request: Request,
): Record<string, unknown> | undefined => {
  switch (source) {
    case 'body':
      return asRecord(extractBody(request));
    case 'query':
      return asRecord(request.query);
    case 'header':
      return asRecord(request.headers);
    default:
      return undefined;
  }
};

export const resolveWorkspaceIdFromRequest = ({
  resolver,
  request,
}: {
  resolver: IngressTriggerSettings['workspaceId'];
  request: Request;
}): string | undefined => {
  const segments = resolver.path.split('.');

  if (
    segments.length === 0 ||
    segments.some(
      (segment) =>
        !SAFE_PATH_SEGMENT.test(segment) ||
        FORBIDDEN_PATH_SEGMENTS.has(segment),
    )
  ) {
    return undefined;
  }

  const root = getResolverRoot(resolver.source, request);

  if (!isDefined(root)) {
    return undefined;
  }

  const value = segments.reduce<unknown>(
    (current, key) => asRecord(current)?.[key],
    root,
  );

  return asString(value);
};
