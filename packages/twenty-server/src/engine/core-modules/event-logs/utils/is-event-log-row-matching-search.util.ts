/* @license Enterprise */

import { isNonEmptyString, isObject } from '@sniptt/guards';
import { safeGetNestedProperty } from 'twenty-shared/utils';

const omitNullValue = (_key: string, value: unknown) => value ?? undefined;

const toClickHouseString = (value: unknown): string =>
  isObject(value)
    ? JSON.stringify(value, omitNullValue).replace(/\//g, '\\/')
    : String(value ?? '');

export const isEventLogRowMatchingSearch = ({
  row,
  search,
  searchableFields,
}: {
  row: Record<string, unknown>;
  search: string;
  searchableFields: string[];
}): boolean =>
  search
    .toLowerCase()
    .split(/\s+/)
    .filter(isNonEmptyString)
    .every((searchWord) =>
      searchableFields.some((field) =>
        toClickHouseString(safeGetNestedProperty(row, field))
          .toLowerCase()
          .includes(searchWord),
      ),
    );
