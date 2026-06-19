import { isArray, isObject, isString } from '@sniptt/guards';
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
  isObject(value) && !isArray(value)
    ? (value as Record<string, unknown>)
    : undefined;

const asNonEmptyString = (value: unknown): string | undefined =>
  isString(value) && value.length > 0 ? value : undefined;

const asString = (value: unknown): string | undefined => {
  if (isArray(value)) {
    return asNonEmptyString(value[0]);
  }

  return asNonEmptyString(value);
};

const getResolverRoot = (
  source: IngressTriggerSettings['workspaceIdResolver']['source'],
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
  resolver: IngressTriggerSettings['workspaceIdResolver'];
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
