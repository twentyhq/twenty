import {
  type DashboardFilterValue,
  type FirstDayOfTheWeek,
  type PageLayoutFilterCondition,
  type PageLayoutFilterValue,
  ViewFilterOperand,
} from 'twenty-shared/types';
import {
  isDefined,
  isNonEmptyArray,
  relativeDateFilterStringifiedSchema,
  stringifyRelativeDateFilter,
} from 'twenty-shared/utils';
import { type PageLayoutFilter } from '~/generated-metadata/graphql';

// Without an embedded week start, server paths use the widget's and browser paths the viewer's
const withFirstDayOfTheWeek = ({
  condition: { operand, value },
  timeZone,
  firstDayOfTheWeek,
}: {
  condition: PageLayoutFilterCondition;
  timeZone: string;
  firstDayOfTheWeek: FirstDayOfTheWeek;
}): PageLayoutFilterCondition => {
  const relativeDateFilter =
    operand === ViewFilterOperand.IS_RELATIVE
      ? relativeDateFilterStringifiedSchema.safeParse(value)
      : undefined;

  if (
    !relativeDateFilter?.success ||
    isDefined(relativeDateFilter.data.firstDayOfTheWeek)
  ) {
    return { operand, value };
  }

  return {
    operand,
    value: stringifyRelativeDateFilter({
      ...relativeDateFilter.data,
      timezone: relativeDateFilter.data.timezone ?? timeZone,
      firstDayOfTheWeek,
    }),
  };
};

export const getEffectiveDashboardFilterValues = ({
  pageLayoutFilters,
  urlValueByPageLayoutFilterId,
  timeZone,
  firstDayOfTheWeek,
}: {
  pageLayoutFilters: (Pick<PageLayoutFilter, 'id' | 'type'> & {
    defaultValue?: PageLayoutFilterValue | null;
  })[];
  urlValueByPageLayoutFilterId: Record<string, PageLayoutFilterValue>;
  timeZone: string;
  firstDayOfTheWeek: FirstDayOfTheWeek;
}): DashboardFilterValue[] =>
  pageLayoutFilters.flatMap(({ id, type, defaultValue }) => {
    const value = urlValueByPageLayoutFilterId[id] ?? defaultValue;

    return isDefined(value) && isNonEmptyArray(value.conditions)
      ? [
          {
            pageLayoutFilterId: id,
            type,
            conditions: value.conditions.map((condition) =>
              withFirstDayOfTheWeek({ condition, timeZone, firstDayOfTheWeek }),
            ),
          },
        ]
      : [];
  });
