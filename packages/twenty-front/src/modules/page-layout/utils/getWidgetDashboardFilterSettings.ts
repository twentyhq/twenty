import { type DashboardFilterWidgetField } from '@/page-layout/types/DashboardFilterWidgetField';
import { type DashboardFilterWidgetSetting } from '@/page-layout/types/DashboardFilterWidgetSetting';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { getDashboardFilterWidgetCandidateFieldMetadataIds } from '@/page-layout/utils/getDashboardFilterWidgetCandidateFieldMetadataIds';
import { getDashboardFilterWidgetSetting } from '@/page-layout/utils/getDashboardFilterWidgetSetting';
import { getWidgetDashboardFilterBindings } from '@/page-layout/utils/getWidgetDashboardFilterBindings';
import { type PageLayoutFilter } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

export const getWidgetDashboardFilterSettings = ({
  pageLayoutFilters,
  configuration,
  fields,
  viewFilterFieldMetadataIds,
}: {
  pageLayoutFilters: Pick<
    PageLayoutFilter,
    'id' | 'type' | 'label' | 'defaultValue'
  >[];
  configuration: PageLayoutWidget['configuration'];
  fields: DashboardFilterWidgetField[];
  viewFilterFieldMetadataIds: string[];
}): {
  settings: (DashboardFilterWidgetSetting & {
    pageLayoutFilter: Pick<PageLayoutFilter, 'id' | 'label' | 'defaultValue'>;
  })[];
  overlappingFieldLabels: string[];
} => {
  const candidateFieldMetadataIds =
    getDashboardFilterWidgetCandidateFieldMetadataIds({
      configuration,
      viewFilterFieldMetadataIds,
    });
  const bindings = getWidgetDashboardFilterBindings(configuration);

  const settings = pageLayoutFilters.map((pageLayoutFilter) => ({
    pageLayoutFilter,
    ...getDashboardFilterWidgetSetting({
      pageLayoutFilter,
      bindings,
      candidateFieldMetadataIds,
      fields,
    }),
  }));

  const overlappingFieldMetadataIds = new Set(
    settings
      .map(({ resolution }) => resolution.fieldMetadataId)
      .filter(
        (fieldMetadataId): fieldMetadataId is string =>
          isDefined(fieldMetadataId) &&
          candidateFieldMetadataIds.widgetFilterFieldMetadataIds.includes(
            fieldMetadataId,
          ),
      ),
  );

  return {
    settings,
    overlappingFieldLabels: fields
      .filter(({ id }) => overlappingFieldMetadataIds.has(id))
      .map(({ label }) => label),
  };
};
