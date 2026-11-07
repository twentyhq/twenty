import { type DashboardFilterBinding } from '~/generated-metadata/graphql';

export const getDashboardFilterBindingsOverlappingWidgetFilter = ({
  dashboardFilterBindings,
  pageLayoutFilterIds,
  widgetFilterFieldMetadataIds,
}: {
  dashboardFilterBindings: Pick<
    DashboardFilterBinding,
    'pageLayoutFilterId' | 'fieldMetadataId'
  >[];
  pageLayoutFilterIds: string[];
  widgetFilterFieldMetadataIds: string[];
}) =>
  dashboardFilterBindings.filter(
    ({ pageLayoutFilterId, fieldMetadataId }) =>
      pageLayoutFilterIds.includes(pageLayoutFilterId) &&
      widgetFilterFieldMetadataIds.includes(fieldMetadataId),
  );
