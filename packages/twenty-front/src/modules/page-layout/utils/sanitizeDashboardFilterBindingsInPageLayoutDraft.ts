import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type DraftPageLayout } from '@/page-layout/types/DraftPageLayout';
import { isUndefined } from '@sniptt/guards';
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
}): DraftPageLayout => {
  const pageLayoutFilterIds = isUndefined(pageLayoutDraft.filters)
    ? undefined
    : new Set((pageLayoutDraft.filters ?? []).map(({ id }) => id));

  return {
    ...pageLayoutDraft,
    tabs: pageLayoutDraft.tabs.map((tab) => ({
      ...tab,
      widgets: tab.widgets.map((widget) => {
        if (
          !isDefined(widget.configuration) ||
          !('dashboardFilterBindings' in widget.configuration) ||
          !isDefined(widget.configuration.dashboardFilterBindings)
        ) {
          return widget;
        }

        const fieldMetadataItems = isDefined(widget.objectMetadataId)
          ? fieldMetadataItemsByObjectMetadataId.get(widget.objectMetadataId)
          : undefined;

        const dashboardFilterBindings =
          widget.configuration.dashboardFilterBindings.filter(
            ({ pageLayoutFilterId, fieldMetadataId }) =>
              (!isDefined(pageLayoutFilterIds) ||
                pageLayoutFilterIds.has(pageLayoutFilterId)) &&
              (!isDefined(fieldMetadataItems) ||
                fieldMetadataItems.some(({ id }) => id === fieldMetadataId)),
          );

        if (
          dashboardFilterBindings.length ===
          widget.configuration.dashboardFilterBindings.length
        ) {
          return widget;
        }

        return {
          ...widget,
          configuration: {
            ...widget.configuration,
            dashboardFilterBindings,
          },
        };
      }),
    })),
  };
};
