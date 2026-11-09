import { NO_WIDGET_DASHBOARD_FILTER } from '@/page-layout/constants/NoWidgetDashboardFilter';
import { type DashboardFilters } from '@/page-layout/types/DashboardFilters';
import { type DashboardFilterWidgetConfiguration } from '@/page-layout/types/DashboardFilterWidgetConfiguration';
import { type DashboardFilterWidgetField } from '@/page-layout/types/DashboardFilterWidgetField';
import { type WidgetDashboardFilter } from '@/page-layout/types/WidgetDashboardFilter';
import { getDashboardFilterWidgetCandidateFieldMetadataIds } from '@/page-layout/utils/getDashboardFilterWidgetCandidateFieldMetadataIds';
import { getWidgetDashboardFilterBindings } from '@/page-layout/utils/getWidgetDashboardFilterBindings';
import { getWidgetDashboardFilterIndicators } from '@/page-layout/utils/getWidgetDashboardFilterIndicators';
import { isDashboardFilterDataWidgetConfiguration } from '@/page-layout/utils/isDashboardFilterDataWidgetConfiguration';
import { type RecordFilterValueDependencies } from 'twenty-shared/types';
import {
  buildDashboardFilterForWidget,
  computeRecordGqlOperationFilter,
  InvalidDashboardFilterError,
  isNonEmptyArray,
} from 'twenty-shared/utils';

export const computeDashboardFilterForWidget = ({
  dashboardFilters,
  configuration,
  fields,
  viewFilterFieldMetadataIds,
  filterValueDependencies,
}: {
  dashboardFilters: Pick<
    DashboardFilters,
    'pageLayoutFilters' | 'values' | 'timeZone' | 'firstDayOfTheWeek'
  >;
  configuration: DashboardFilterWidgetConfiguration;
  fields: Omit<DashboardFilterWidgetField, 'icon' | 'isActive'>[];
  viewFilterFieldMetadataIds: string[];
  filterValueDependencies: RecordFilterValueDependencies;
}): WidgetDashboardFilter => {
  const { values, timeZone, firstDayOfTheWeek } = dashboardFilters;

  if (!isDashboardFilterDataWidgetConfiguration(configuration)) {
    return NO_WIDGET_DASHBOARD_FILTER;
  }

  const bindings = getWidgetDashboardFilterBindings(configuration);
  const candidateFieldMetadataIds =
    getDashboardFilterWidgetCandidateFieldMetadataIds({
      configuration,
      viewFilterFieldMetadataIds,
    });

  // Until the object's fields load, every filter would read as an unavailable field
  const getIndicators = (
    appliedFields: WidgetDashboardFilter['appliedFields'],
  ) =>
    isNonEmptyArray(fields)
      ? getWidgetDashboardFilterIndicators({
          dashboardFilters,
          bindings,
          candidateFieldMetadataIds,
          appliedFields,
          fields,
        })
      : [];

  if (!isNonEmptyArray(values)) {
    return { ...NO_WIDGET_DASHBOARD_FILTER, indicators: getIndicators([]) };
  }

  try {
    const dashboardFilter = buildDashboardFilterForWidget({
      bindings,
      ...candidateFieldMetadataIds,
      fields,
      values,
      timeZone,
      firstDayOfTheWeek,
    });

    return {
      ...dashboardFilter,
      isInvalid: false,
      gqlOperationFilter: computeRecordGqlOperationFilter({
        fieldMetadataItems: fields,
        filterValueDependencies,
        recordFilters: dashboardFilter.recordFilters,
        recordFilterGroups: [],
      }),
      indicators: getIndicators(dashboardFilter.appliedFields),
    };
  } catch (error) {
    if (!(error instanceof InvalidDashboardFilterError)) {
      throw error;
    }

    // A value that cannot be resolved must never render as an unfiltered widget
    return {
      ...NO_WIDGET_DASHBOARD_FILTER,
      isInvalid: true,
      indicators: getIndicators([]),
    };
  }
};
