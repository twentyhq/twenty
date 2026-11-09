import { NO_WIDGET_DASHBOARD_FILTER } from '@/page-layout/constants/NoWidgetDashboardFilter';
import { type DashboardFilters } from '@/page-layout/types/DashboardFilters';
import { type DashboardFilterWidgetConfiguration } from '@/page-layout/types/DashboardFilterWidgetConfiguration';
import { type DashboardFilterWidgetField } from '@/page-layout/types/DashboardFilterWidgetField';
import { type DashboardFilterWidgetFilter } from '@/page-layout/types/DashboardFilterWidgetFilter';
import { type WidgetDashboardFilter } from '@/page-layout/types/WidgetDashboardFilter';
import { getDashboardFilterWidgetCandidateFieldMetadataIds } from '@/page-layout/utils/getDashboardFilterWidgetCandidateFieldMetadataIds';
import { getWidgetDashboardFilterBindings } from '@/page-layout/utils/getWidgetDashboardFilterBindings';
import { isDashboardFilterDataWidgetConfiguration } from '@/page-layout/utils/isDashboardFilterDataWidgetConfiguration';
import { type RecordFilterValueDependencies } from 'twenty-shared/types';
import {
  buildDashboardFilterForWidget,
  computeRecordGqlOperationFilter,
  InvalidDashboardFilterError,
  isDefined,
  isNonEmptyArray,
  replaceWidgetFilterPeriodsWithDashboardFilter,
} from 'twenty-shared/utils';

export const computeDashboardFilterForWidget = ({
  dashboardFilters: { values, timeZone, firstDayOfTheWeek },
  configuration,
  fields,
  widgetFilter,
  filterValueDependencies,
}: {
  dashboardFilters: Pick<
    DashboardFilters,
    'values' | 'timeZone' | 'firstDayOfTheWeek'
  >;
  configuration: DashboardFilterWidgetConfiguration;
  fields: Omit<DashboardFilterWidgetField, 'icon' | 'isActive'>[];
  widgetFilter: DashboardFilterWidgetFilter;
  filterValueDependencies: RecordFilterValueDependencies;
}): WidgetDashboardFilter => {
  if (
    !isNonEmptyArray(values) ||
    !isDashboardFilterDataWidgetConfiguration(configuration)
  ) {
    return NO_WIDGET_DASHBOARD_FILTER;
  }

  try {
    const dashboardFilter = buildDashboardFilterForWidget({
      bindings: getWidgetDashboardFilterBindings(configuration),
      ...getDashboardFilterWidgetCandidateFieldMetadataIds({
        configuration,
        widgetFilter,
      }),
      fields,
      values,
      timeZone,
      firstDayOfTheWeek,
    });

    const { replacedRecordFilters } =
      replaceWidgetFilterPeriodsWithDashboardFilter({
        filter: widgetFilter,
        fieldMetadataIds: dashboardFilter.appliedFields.map(
          ({ fieldMetadataId }) => fieldMetadataId,
        ),
      });

    return {
      ...dashboardFilter,
      replacedWidgetRecordFilterIds: replacedRecordFilters
        .map(({ id }) => id)
        .filter(isDefined),
      isInvalid: false,
      gqlOperationFilter: computeRecordGqlOperationFilter({
        fieldMetadataItems: fields,
        filterValueDependencies,
        recordFilters: dashboardFilter.recordFilters,
        recordFilterGroups: [],
      }),
    };
  } catch (error) {
    if (!(error instanceof InvalidDashboardFilterError)) {
      throw error;
    }

    // A value that cannot be resolved must never render as an unfiltered widget
    return { ...NO_WIDGET_DASHBOARD_FILTER, isInvalid: true };
  }
};
