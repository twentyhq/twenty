import { type DashboardFilters } from '@/page-layout/types/DashboardFilters';
import { type DashboardFilterWidgetField } from '@/page-layout/types/DashboardFilterWidgetField';
import { type WidgetDashboardFilter } from '@/page-layout/types/WidgetDashboardFilter';
import { type WidgetDashboardFilterIndicator } from '@/page-layout/types/WidgetDashboardFilterIndicator';
import { isDefined } from 'twenty-shared/utils';

export const getWidgetDashboardFilterIndicators = ({
  dashboardFilters: { pageLayoutFilters, values },
  widgetDashboardFilter: {
    appliedFields,
    notAppliedPageLayoutFilterIds,
    unresolvedPageLayoutFilterIds,
  },
  fields,
}: {
  dashboardFilters: Pick<DashboardFilters, 'pageLayoutFilters' | 'values'>;
  widgetDashboardFilter: Pick<
    WidgetDashboardFilter,
    | 'appliedFields'
    | 'notAppliedPageLayoutFilterIds'
    | 'unresolvedPageLayoutFilterIds'
  >;
  fields: Pick<DashboardFilterWidgetField, 'id' | 'label'>[];
}): WidgetDashboardFilterIndicator[] => {
  const valueByPageLayoutFilterId = new Map(
    values.map((value) => [value.pageLayoutFilterId, value]),
  );
  const appliedFieldMetadataIdByPageLayoutFilterId = new Map(
    appliedFields.map(({ pageLayoutFilterId, fieldMetadataId }) => [
      pageLayoutFilterId,
      fieldMetadataId,
    ]),
  );
  const fieldLabelById = new Map(fields.map(({ id, label }) => [id, label]));
  const notFilteredPageLayoutFilterIds = new Set([
    ...notAppliedPageLayoutFilterIds,
    ...unresolvedPageLayoutFilterIds,
  ]);

  return pageLayoutFilters.flatMap(
    ({ id, label }): WidgetDashboardFilterIndicator[] => {
      const value = valueByPageLayoutFilterId.get(id);

      if (!isDefined(value)) {
        return [];
      }

      const appliedFieldMetadataId =
        appliedFieldMetadataIdByPageLayoutFilterId.get(id);

      if (isDefined(appliedFieldMetadataId)) {
        const fieldLabel = fieldLabelById.get(appliedFieldMetadataId);

        return isDefined(fieldLabel)
          ? [{ pageLayoutFilterId: id, label, value, fieldLabel }]
          : [];
      }

      return notFilteredPageLayoutFilterIds.has(id)
        ? [{ pageLayoutFilterId: id, label, value, fieldLabel: null }]
        : [];
    },
  );
};
