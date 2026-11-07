import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type DraftPageLayout } from '@/page-layout/types/DraftPageLayout';
import { isDefined } from 'twenty-shared/utils';

export const sanitizeDashboardFilterBindingsInPageLayoutDraft = ({
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
        !isDefined(widget.configuration) ||
        !('dashboardFilterBindings' in widget.configuration) ||
        !isDefined(widget.configuration.dashboardFilterBindings)
      ) {
        return widget;
      }

      return {
        ...widget,
        configuration: {
          ...widget.configuration,
          dashboardFilterBindings:
            widget.configuration.dashboardFilterBindings.filter(
              ({ fieldMetadataId }) =>
                fieldMetadataItems.some(({ id }) => id === fieldMetadataId),
            ),
        },
      };
    }),
  })),
});
