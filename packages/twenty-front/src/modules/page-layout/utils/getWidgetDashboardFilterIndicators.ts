import { type DashboardFilters } from '@/page-layout/types/DashboardFilters';
import { type DashboardFilterWidgetField } from '@/page-layout/types/DashboardFilterWidgetField';
import { type WidgetDashboardFilter } from '@/page-layout/types/WidgetDashboardFilter';
import { type WidgetDashboardFilterIndicator } from '@/page-layout/types/WidgetDashboardFilterIndicator';
import { getPageLayoutFilterDisplayLabel } from '@/page-layout/utils/getPageLayoutFilterDisplayLabel';
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
  const filteredPageLayoutFilterIds = new Set(
    values.map(({ pageLayoutFilterId }) => pageLayoutFilterId),
  );
  const fieldLabelById = new Map(fields.map(({ id, label }) => [id, label]));

  return pageLayoutFilters.flatMap(
    (pageLayoutFilter): WidgetDashboardFilterIndicator[] => {
      const { id } = pageLayoutFilter;

      if (!filteredPageLayoutFilterIds.has(id)) {
        return [];
      }

      const label = getPageLayoutFilterDisplayLabel(pageLayoutFilter);

      if (notAppliedPageLayoutFilterIds.includes(id)) {
        return [{ pageLayoutFilterId: id, label, kind: 'IGNORED' }];
      }

      if (unresolvedPageLayoutFilterIds.includes(id)) {
        return [{ pageLayoutFilterId: id, label, kind: 'UNRESOLVED' }];
      }

      const overrideField = appliedFields.find(
        (appliedField) =>
          appliedField.pageLayoutFilterId === id &&
          appliedField.source === 'OVERRIDE',
      );
      const overrideFieldLabel = isDefined(overrideField)
        ? fieldLabelById.get(overrideField.fieldMetadataId)
        : undefined;

      return isDefined(overrideFieldLabel)
        ? [
            {
              pageLayoutFilterId: id,
              label,
              kind: 'OVERRIDE',
              fieldLabel: overrideFieldLabel,
            },
          ]
        : [];
    },
  );
};
