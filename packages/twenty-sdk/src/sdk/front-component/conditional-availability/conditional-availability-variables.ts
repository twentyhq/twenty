import { type CommandMenuContextApi } from 'twenty-shared/types';

export const pageType = null as unknown as CommandMenuContextApi['pageType'];
export const isInSidePanel =
  null as unknown as CommandMenuContextApi['isInSidePanel'];
export const isDashboardPageLayoutInEditMode =
  null as unknown as CommandMenuContextApi['isDashboardPageLayoutInEditMode'];
export const isLayoutCustomizationModeEnabled =
  null as unknown as CommandMenuContextApi['isLayoutCustomizationModeEnabled'];
export const favoriteRecordIds =
  null as unknown as CommandMenuContextApi['favoriteRecordIds'];
export const isSelectAll =
  null as unknown as CommandMenuContextApi['isSelectAll'];
export const hasAnySoftDeleteFilterOnView =
  null as unknown as CommandMenuContextApi['hasAnySoftDeleteFilterOnView'];
export const numberOfSelectedRecords =
  null as unknown as CommandMenuContextApi['numberOfSelectedRecords'];
export const objectPermissions =
  null as unknown as CommandMenuContextApi['objectPermissions'];
export const selectedRecords =
  null as unknown as CommandMenuContextApi['selectedRecords'];
export const featureFlags =
  null as unknown as CommandMenuContextApi['featureFlags'];
export const targetObjectReadPermissions =
  null as unknown as CommandMenuContextApi['targetObjectReadPermissions'];
export const targetObjectWritePermissions =
  null as unknown as CommandMenuContextApi['targetObjectWritePermissions'];
export const canImpersonate =
  null as unknown as CommandMenuContextApi['canImpersonate'];
export const canAccessFullAdminPanel =
  null as unknown as CommandMenuContextApi['canAccessFullAdminPanel'];

import { isDefined as realIsDefined, safeGetNestedProperty } from 'twenty-shared/utils';
import { isNonEmptyString as realIsNonEmptyString, isNonEmptyArray } from '@sniptt/guards';

export const objectMetadataItem =
  null as unknown as CommandMenuContextApi['objectMetadataItem'];

export const objectMetadataLabel =
  null as unknown as CommandMenuContextApi['objectMetadataLabel'];

export const isDefined = realIsDefined;
export const isNonEmptyString = realIsNonEmptyString;

export const includes = (array: unknown, value: unknown): boolean =>
  Array.isArray(array) && array.includes(value);

type ArrayMethod = 'every' | 'some';

const createArrayPropCheck = (
  method: ArrayMethod,
  predicate: (value: unknown) => boolean,
) => {
  return (array: unknown, prop: string): boolean => {
    if (!isNonEmptyArray(array)) {
      return false;
    }

    return array[method]((item) =>
      predicate(safeGetNestedProperty(item, prop)),
    );
  };
};

const createArrayPropValueCheck = (
  method: ArrayMethod,
  predicate: (value: unknown, target: unknown) => boolean,
) => {
  return (array: unknown, prop: string, value: unknown): boolean => {
    if (!isNonEmptyArray(array)) {
      return false;
    }

    return array[method]((item) =>
      predicate(safeGetNestedProperty(item, prop), value),
    );
  };
};

export const every = createArrayPropCheck('every', Boolean);

export const everyDefined = createArrayPropCheck('every', isDefined);

export const everyEquals = createArrayPropValueCheck(
  'every',
  (a, b) => a === b,
);

export const some = createArrayPropCheck('some', Boolean);

export const someDefined = createArrayPropCheck('some', isDefined);

export const someEquals = createArrayPropValueCheck(
  'some',
  (a, b) => a === b,
);

export const none = createArrayPropCheck('every', (value) => !Boolean(value));

export const noneDefined = createArrayPropCheck('every', (value) => !isDefined(value));

export const noneEquals = createArrayPropValueCheck(
  'every',
  (a, b) => a !== b,
);

export const someNonEmptyString = createArrayPropCheck('some', isNonEmptyString);

export const includesEvery = createArrayPropValueCheck(
  'every',
  (array, value) => Array.isArray(array) && array.includes(value),
);
