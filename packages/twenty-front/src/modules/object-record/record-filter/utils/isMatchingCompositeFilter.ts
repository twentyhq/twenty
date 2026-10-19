import { isDefined } from 'twenty-shared/utils';

type CompositeSubFieldMatchers<
  TCompositeFilter extends object,
  TCompositeValue extends {
    [TSubFieldName in keyof TCompositeFilter]?: unknown;
  },
> = {
  [TSubFieldName in keyof TCompositeFilter]-?: (
    subFieldFilter: NonNullable<TCompositeFilter[TSubFieldName]>,
    subFieldValue: TCompositeValue[TSubFieldName] | undefined,
  ) => boolean;
};

export const isMatchingCompositeFilter = <
  TCompositeFilter extends object,
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
}): boolean =>
  (Object.keys(subFieldMatchers) as (keyof TCompositeFilter)[]).every(
    (subFieldName) => {
      const subFieldFilter = compositeFilter[subFieldName];

      return (
        !isDefined(subFieldFilter) ||
        subFieldMatchers[subFieldName](
          subFieldFilter,
          compositeValue?.[subFieldName],
        )
      );
    },
  );
