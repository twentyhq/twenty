import { isArray, isBoolean, isNumber, isString } from '@sniptt/guards';
import { isPlainObject } from 'twenty-shared/utils';

import {
  PULL_ENTITY_KINDS,
  type PullEntityKind,
  type SkippedPullEntity,
} from '@/app/pull/build-pull-entities';
import { type PullDeletion } from '@/app/pull/plan-pull-writes';
import { type PullAppResult } from '@/app/pull/types';

const isPullEntityKind = (value: unknown): value is PullEntityKind =>
  isString(value) && PULL_ENTITY_KINDS.some((kind) => kind === value);

const isPath = (value: unknown): value is PullDeletion =>
  isPlainObject(value) &&
  isString(value.universalIdentifier) &&
  isString(value.relativePath);

const isWrite = (value: unknown): value is PullAppResult['writes'][number] =>
  isPlainObject(value) &&
  (isPullEntityKind(value.kind) || value.kind === 'translation') &&
  isBoolean(value.isRegeneration) &&
  isPath(value);

const isSkipped = (value: unknown): value is SkippedPullEntity =>
  isPlainObject(value) &&
  isPullEntityKind(value.kind) &&
  isString(value.universalIdentifier) &&
  isString(value.reason);

const isStringMap = (value: unknown): value is Record<string, string> =>
  isPlainObject(value) && Object.values(value).every(isString);

const isNumberMap = (value: unknown): value is Record<string, number> =>
  isPlainObject(value) && Object.values(value).every(isNumber);

export const parsePullData = (
  value: unknown,
): { data: PullAppResult } | undefined => {
  if (
    !isPlainObject(value) ||
    !isPlainObject(value.application) ||
    !isString(value.application.universalIdentifier) ||
    !isString(value.application.displayName) ||
    !isPlainObject(value.base) ||
    !isArray(value.writes) ||
    !value.writes.every(isWrite) ||
    !isArray(value.deletions) ||
    !value.deletions.every(isPath) ||
    !isArray(value.overwrittenLocalChanges) ||
    !value.overwrittenLocalChanges.every(isPath) ||
    !isNumber(value.unchangedCount) ||
    !isArray(value.localOnlyRelativePaths) ||
    !value.localOnlyRelativePaths.every(isString) ||
    !isArray(value.unreadableRelativePaths) ||
    !value.unreadableRelativePaths.every(isString) ||
    !isArray(value.skipped) ||
    !value.skipped.every(isSkipped) ||
    !isNumberMap(value.compiledTranslationEntryCountByLocale) ||
    !isStringMap(value.entityLabelByUniversalIdentifier)
  ) {
    return undefined;
  }

  const status = value.base.status;

  if (
    status !== 'used' &&
    status !== 'missing' &&
    status !== 'other-target' &&
    status !== 'unbound' &&
    status !== 'unreadable'
  ) {
    return undefined;
  }

  return {
    data: {
      application: {
        universalIdentifier: value.application.universalIdentifier,
        displayName: value.application.displayName,
      },
      base: { status },
      writes: value.writes,
      deletions: value.deletions,
      overwrittenLocalChanges: value.overwrittenLocalChanges,
      unchangedCount: value.unchangedCount,
      localOnlyRelativePaths: value.localOnlyRelativePaths,
      unreadableRelativePaths: value.unreadableRelativePaths,
      skipped: value.skipped,
      compiledTranslationEntryCountByLocale:
        value.compiledTranslationEntryCountByLocale,
      entityLabelByUniversalIdentifier: value.entityLabelByUniversalIdentifier,
    },
  };
};
