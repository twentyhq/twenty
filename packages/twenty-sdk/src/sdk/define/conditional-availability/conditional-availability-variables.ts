import { type CommandMenuContextApi } from 'twenty-shared/types';

const isPromiseUnwrapProbe = (property: string | symbol): boolean =>
  property === 'then';

const isSymbolProbe = (property: string | symbol): boolean =>
  typeof property === 'symbol';

const createExpressionOnlyPlaceholder = (name: string): unknown => {
  const fail = (): never => {
    throw new Error(
      `"${name}" from twenty-sdk can only be used inside a command's conditionalAvailabilityExpression, not at runtime.`,
    );
  };

  const handler: ProxyHandler<() => void> = {
    get: (_target, property) => {
      if (isPromiseUnwrapProbe(property) || isSymbolProbe(property)) {
        return undefined;
      }

      return fail();
    },
    apply: fail,
    construct: fail,
    has: fail,
  };

  return new Proxy(function expressionOnlyPlaceholder() {}, handler);
};

export const pageType = createExpressionOnlyPlaceholder(
  'pageType',
) as CommandMenuContextApi['pageType'];

export const isInSidePanel = createExpressionOnlyPlaceholder(
  'isInSidePanel',
) as CommandMenuContextApi['isInSidePanel'];

export const isDashboardPageLayoutInEditMode = createExpressionOnlyPlaceholder(
  'isDashboardPageLayoutInEditMode',
) as CommandMenuContextApi['isDashboardPageLayoutInEditMode'];

export const isLayoutCustomizationModeEnabled = createExpressionOnlyPlaceholder(
  'isLayoutCustomizationModeEnabled',
) as CommandMenuContextApi['isLayoutCustomizationModeEnabled'];

export const favoriteRecordIds = createExpressionOnlyPlaceholder(
  'favoriteRecordIds',
) as CommandMenuContextApi['favoriteRecordIds'];

export const isSelectAll = createExpressionOnlyPlaceholder(
  'isSelectAll',
) as CommandMenuContextApi['isSelectAll'];

export const hasAnySoftDeleteFilterOnView = createExpressionOnlyPlaceholder(
  'hasAnySoftDeleteFilterOnView',
) as CommandMenuContextApi['hasAnySoftDeleteFilterOnView'];

export const numberOfSelectedRecords = createExpressionOnlyPlaceholder(
  'numberOfSelectedRecords',
) as CommandMenuContextApi['numberOfSelectedRecords'];

export const objectPermissions = createExpressionOnlyPlaceholder(
  'objectPermissions',
) as CommandMenuContextApi['objectPermissions'];

export const selectedRecords = createExpressionOnlyPlaceholder(
  'selectedRecords',
) as CommandMenuContextApi['selectedRecords'];

export const featureFlags = createExpressionOnlyPlaceholder(
  'featureFlags',
) as CommandMenuContextApi['featureFlags'];

export const targetObjectReadPermissions = createExpressionOnlyPlaceholder(
  'targetObjectReadPermissions',
) as CommandMenuContextApi['targetObjectReadPermissions'];

export const targetObjectWritePermissions = createExpressionOnlyPlaceholder(
  'targetObjectWritePermissions',
) as CommandMenuContextApi['targetObjectWritePermissions'];

export const canImpersonate = createExpressionOnlyPlaceholder(
  'canImpersonate',
) as CommandMenuContextApi['canImpersonate'];

export const canAccessFullAdminPanel = createExpressionOnlyPlaceholder(
  'canAccessFullAdminPanel',
) as CommandMenuContextApi['canAccessFullAdminPanel'];

export const objectMetadataItem = createExpressionOnlyPlaceholder(
  'objectMetadataItem',
) as CommandMenuContextApi['objectMetadataItem'];

export const objectMetadataLabel = createExpressionOnlyPlaceholder(
  'objectMetadataLabel',
) as CommandMenuContextApi['objectMetadataLabel'];

export const isDefined = createExpressionOnlyPlaceholder('isDefined') as (
  value: unknown,
) => boolean;

export const isNonEmptyString = createExpressionOnlyPlaceholder(
  'isNonEmptyString',
) as (value: unknown) => boolean;

export const includes = createExpressionOnlyPlaceholder('includes') as (
  array: unknown,
  value: unknown,
) => boolean;

export const every = createExpressionOnlyPlaceholder('every') as (
  array: unknown,
  prop: string,
) => boolean;

export const everyDefined = createExpressionOnlyPlaceholder('everyDefined') as (
  array: unknown,
  prop: string,
) => boolean;

export const everyEquals = createExpressionOnlyPlaceholder('everyEquals') as (
  array: unknown,
  prop: string,
  value: unknown,
) => boolean;

export const some = createExpressionOnlyPlaceholder('some') as (
  array: unknown,
  prop: string,
) => boolean;

export const someDefined = createExpressionOnlyPlaceholder('someDefined') as (
  array: unknown,
  prop: string,
) => boolean;

export const someEquals = createExpressionOnlyPlaceholder('someEquals') as (
  array: unknown,
  prop: string,
  value: unknown,
) => boolean;

export const none = createExpressionOnlyPlaceholder('none') as (
  array: unknown,
  prop: string,
) => boolean;

export const noneDefined = createExpressionOnlyPlaceholder('noneDefined') as (
  array: unknown,
  prop: string,
) => boolean;

export const noneEquals = createExpressionOnlyPlaceholder('noneEquals') as (
  array: unknown,
  prop: string,
  value: unknown,
) => boolean;

export const someNonEmptyString = createExpressionOnlyPlaceholder(
  'someNonEmptyString',
) as (array: unknown, prop: string) => boolean;

export const includesEvery = createExpressionOnlyPlaceholder(
  'includesEvery',
) as (array: unknown, prop: string, value: unknown) => boolean;
