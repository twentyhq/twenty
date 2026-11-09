import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type DraftPageLayout } from '@/page-layout/types/DraftPageLayout';
import { isDefined } from 'twenty-shared/utils';

// The server rejects such an override, so dropping it never changes a binding it would accept
export const dropDashboardFilterOverridesToMissingFields = ({
  pageLayoutDraft,
  fieldMetadataItemsByObjectMetadataId,
}: {
  pageLayoutDraft: DraftPageLayout;
  fieldMetadataItemsByObjectMetadataId: Map<
    string,
    Pick<FieldMetadataItem, 'id'>[]
  >;
}): DraftPageLayout => ({
  ...pageLayoutDraft,
  tabs: pageLayoutDraft.tabs.map((tab) => ({
    ...tab,
    widgets: tab.widgets.map((widget) => {
      const fieldMetadataItems = isDefined(widget.objectMetadataId)
        ? fieldMetadataItemsByObjectMetadataId.get(widget.objectMetadataId)
        : undefined;

      if (
        !isDefined(fieldMetadataItems) ||
        !('dashboardFilterBindings' in widget.configuration) ||
        !isDefined(widget.configuration.dashboardFilterBindings)
      ) {
        return widget;
      }

      const dashboardFilterBindings =
        widget.configuration.dashboardFilterBindings.filter(
          ({ fieldMetadataId }) =>
            !isDefined(fieldMetadataId) ||
            fieldMetadataItems.some(({ id }) => id === fieldMetadataId),
        );

      if (
        dashboardFilterBindings.length ===
        widget.configuration.dashboardFilterBindings.length
      ) {
        return widget;
      }

      return {
        ...widget,
        configuration: { ...widget.configuration, dashboardFilterBindings },
      };
    }),
  })),
});
