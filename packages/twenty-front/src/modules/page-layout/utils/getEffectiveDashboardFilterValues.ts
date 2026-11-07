import { type PageLayoutFilterValue } from 'twenty-shared/types';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

export const getEffectiveDashboardFilterValues = ({
  pageLayoutFilters,
  urlValueByPageLayoutFilterId,
}: {
  pageLayoutFilters: {
    id: string;
    defaultValue?: PageLayoutFilterValue | null;
  }[];
  urlValueByPageLayoutFilterId: Record<string, PageLayoutFilterValue>;
}): Record<string, PageLayoutFilterValue> =>
  Object.fromEntries(
    pageLayoutFilters.flatMap(({ id, defaultValue }) => {
      const value = urlValueByPageLayoutFilterId[id] ?? defaultValue;

      // Rebuilt so GraphQL typenames from the layout default never reach an input
      return isDefined(value) && isNonEmptyArray(value.conditions)
        ? [
            [
              id,
              {
                conditions: value.conditions.map(
                  ({ operand, value: conditionValue }) => ({
                    operand,
                    value: conditionValue,
                  }),
                ),
              },
            ],
          ]
        : [];
    }),
  );
