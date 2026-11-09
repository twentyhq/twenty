import { type DashboardFilters } from '@/page-layout/types/DashboardFilters';
import { type DashboardFilterWidgetField } from '@/page-layout/types/DashboardFilterWidgetField';
import { type DashboardFilterWidgetFilter } from '@/page-layout/types/DashboardFilterWidgetFilter';
import { type WidgetDashboardFilter } from '@/page-layout/types/WidgetDashboardFilter';
import { type WidgetDashboardFilterIndicator } from '@/page-layout/types/WidgetDashboardFilterIndicator';
import { getPageLayoutFilterDisplayLabel } from '@/page-layout/utils/getPageLayoutFilterDisplayLabel';
import { type DashboardFilterBinding } from 'twenty-shared/types';
import {
  type getDashboardFilterCandidateFieldMetadataIds,
  isDefined,
  resolveDashboardFilterFieldForWidget,
} from 'twenty-shared/utils';

// Resolves every filter, with or without a value, so edit mode can show each widget's field
export const getWidgetDashboardFilterIndicators = ({
  dashboardFilters: { pageLayoutFilters, values },
  bindings,
  candidateFieldMetadataIds,
  appliedFields,
  widgetFilterReplacement: {
    replacedRecordFilters,
    stillFilteredFieldMetadataIds,
  },
  fields,
}: {
  dashboardFilters: Pick<DashboardFilters, 'pageLayoutFilters' | 'values'>;
  bindings: DashboardFilterBinding[];
  candidateFieldMetadataIds: ReturnType<
    typeof getDashboardFilterCandidateFieldMetadataIds
  >;
  appliedFields: WidgetDashboardFilter['appliedFields'];
  widgetFilterReplacement: {
    replacedRecordFilters: DashboardFilterWidgetFilter['recordFilters'];
    stillFilteredFieldMetadataIds: string[];
  };
  fields: Pick<DashboardFilterWidgetField, 'id' | 'name' | 'type' | 'label'>[];
}): WidgetDashboardFilterIndicator[] => {
  const filteredPageLayoutFilterIds = new Set(
    values.map(({ pageLayoutFilterId }) => pageLayoutFilterId),
  );
  const fieldLabelById = new Map(fields.map(({ id, label }) => [id, label]));

  return pageLayoutFilters.map(
    (pageLayoutFilter): WidgetDashboardFilterIndicator => {
      const { id: pageLayoutFilterId, type } = pageLayoutFilter;
      const label = getPageLayoutFilterDisplayLabel(pageLayoutFilter);
      const hasValue = filteredPageLayoutFilterIds.has(pageLayoutFilterId);

      const { source, fieldMetadataId } = resolveDashboardFilterFieldForWidget({
        pageLayoutFilterId,
        filterType: type,
        bindings,
        ...candidateFieldMetadataIds,
        fields,
      });

      if (source === 'NOT_APPLIED') {
        return { pageLayoutFilterId, label, hasValue, kind: 'IGNORED' };
      }

      const fieldLabel = isDefined(fieldMetadataId)
        ? fieldLabelById.get(fieldMetadataId)
        : undefined;

      if (source === 'UNRESOLVED' || !isDefined(fieldLabel)) {
        const hasBinding = bindings.some(
          (binding) => binding.pageLayoutFilterId === pageLayoutFilterId,
        );

        return {
          pageLayoutFilterId,
          label,
          hasValue,
          kind: hasBinding ? 'UNAVAILABLE' : 'NO_DATE_FIELD',
        };
      }

      const appliedField = appliedFields.find(
        (appliedField) =>
          appliedField.pageLayoutFilterId === pageLayoutFilterId,
      );

      return isDefined(appliedField)
        ? {
            pageLayoutFilterId,
            label,
            kind: 'APPLIED',
            fieldLabel,
            hasValue: true,
            overlapsWidgetFilter: stillFilteredFieldMetadataIds.includes(
              appliedField.fieldMetadataId,
            ),
            replacedWidgetConditions: replacedRecordFilters.filter(
              (recordFilter) =>
                recordFilter.fieldMetadataId === appliedField.fieldMetadataId,
            ),
          }
        : {
            pageLayoutFilterId,
            label,
            kind: 'APPLIED',
            fieldLabel,
            hasValue: false,
          };
    },
  );
};
