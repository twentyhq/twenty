import { type IsFilter } from 'twenty-shared/types';
import { isDefined, isEmptyObject } from 'twenty-shared/utils';

type CompositeSubFieldFilters<TCompositeFilter> = {
  [TSubFieldName in keyof TCompositeFilter]?: { is?: IsFilter };
};

type CompositeSubFieldMatchers<
  TCompositeFilter extends CompositeSubFieldFilters<TCompositeFilter>,
  TCompositeValue extends {
    [TSubFieldName in keyof TCompositeFilter]?: unknown;
  },
> = {
  [TSubFieldName in keyof TCompositeFilter]-?: ({
    subFieldFilter,
    subFieldValue,
  }: {
    subFieldFilter: NonNullable<TCompositeFilter[TSubFieldName]>;
    subFieldValue: NonNullable<TCompositeValue[TSubFieldName]>;
  }) => boolean;
};

export const isMatchingCompositeFilter = <
  TCompositeFilter extends CompositeSubFieldFilters<TCompositeFilter>,
  TCompositeValue extends {
    [TSubFieldName in keyof TCompositeFilter]?: unknown;
  },
>({
  compositeFilter,
  compositeValue,
  subFieldMatchers,
}: {
  compositeFilter: TCompositeFilter;
  compositeValue: TCompositeValue | null | undefined;
  subFieldMatchers: CompositeSubFieldMatchers<
    TCompositeFilter,
    TCompositeValue
  >;
}): boolean => {
  for (const subFieldName in subFieldMatchers) {
    const subFieldFilter = compositeFilter[subFieldName];

    if (!isDefined(subFieldFilter) || isEmptyObject(subFieldFilter)) {
      continue;
    }

    const subFieldValue = compositeValue?.[subFieldName];

    const isMatching = isDefined(subFieldValue)
      ? subFieldMatchers[subFieldName]({ subFieldFilter, subFieldValue })
      : subFieldFilter.is === 'NULL';

    if (!isMatching) {
      return false;
    }
  }

  return true;
};
