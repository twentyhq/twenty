import { NO_WIDGET_DASHBOARD_FILTER } from '@/page-layout/constants/NoWidgetDashboardFilter';
import { type DashboardFilters } from '@/page-layout/types/DashboardFilters';
import { type DashboardFilterWidgetConfiguration } from '@/page-layout/types/DashboardFilterWidgetConfiguration';
import { type DashboardFilterWidgetField } from '@/page-layout/types/DashboardFilterWidgetField';
import { type DashboardFilterWidgetFilter } from '@/page-layout/types/DashboardFilterWidgetFilter';
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
  isDefined,
  isNonEmptyArray,
  replaceWidgetFilterPeriodsWithDashboardFilter,
} from 'twenty-shared/utils';

const NO_WIDGET_FILTER_REPLACEMENT = {
  replacedRecordFilters: [],
  stillFilteredFieldMetadataIds: [],
};

export const computeDashboardFilterForWidget = ({
  dashboardFilters,
  configuration,
  fields,
  widgetFilter,
  filterValueDependencies,
}: {
  dashboardFilters: Pick<
    DashboardFilters,
    'pageLayoutFilters' | 'values' | 'timeZone' | 'firstDayOfTheWeek'
  >;
  configuration: DashboardFilterWidgetConfiguration;
  fields: Omit<DashboardFilterWidgetField, 'icon' | 'isActive'>[];
  widgetFilter: DashboardFilterWidgetFilter;
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
      widgetFilter,
    });

  // Until the object's fields load, every filter would read as an unavailable field
  const getIndicators = (
    appliedFields: WidgetDashboardFilter['appliedFields'],
    widgetFilterReplacement: Parameters<
      typeof getWidgetDashboardFilterIndicators
    >[0]['widgetFilterReplacement'],
  ) =>
    isNonEmptyArray(fields)
      ? getWidgetDashboardFilterIndicators({
          dashboardFilters,
          bindings,
          candidateFieldMetadataIds,
          appliedFields,
          widgetFilterReplacement,
          fields,
        })
      : [];

  if (!isNonEmptyArray(values)) {
    return {
      ...NO_WIDGET_DASHBOARD_FILTER,
      indicators: getIndicators([], NO_WIDGET_FILTER_REPLACEMENT),
    };
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

    const widgetFilterReplacement =
      replaceWidgetFilterPeriodsWithDashboardFilter({
        filter: widgetFilter,
        fieldMetadataIds: dashboardFilter.appliedFields.map(
          ({ fieldMetadataId }) => fieldMetadataId,
        ),
      });

    return {
      ...dashboardFilter,
      replacedWidgetRecordFilterIds:
        widgetFilterReplacement.replacedRecordFilters
          .map(({ id }) => id)
          .filter(isDefined),
      isInvalid: false,
      gqlOperationFilter: computeRecordGqlOperationFilter({
        fieldMetadataItems: fields,
        filterValueDependencies,
        recordFilters: dashboardFilter.recordFilters,
        recordFilterGroups: [],
      }),
      indicators: getIndicators(
        dashboardFilter.appliedFields,
        widgetFilterReplacement,
      ),
    };
  } catch (error) {
    if (!(error instanceof InvalidDashboardFilterError)) {
      throw error;
    }

    // A value that cannot be resolved must never render as an unfiltered widget
    return {
      ...NO_WIDGET_DASHBOARD_FILTER,
      isInvalid: true,
      indicators: getIndicators([], NO_WIDGET_FILTER_REPLACEMENT),
    };
  }
};
