import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { useFieldListFieldMetadataItems } from '@/object-record/record-field-list/hooks/useFieldListFieldMetadataItems';
import { type PageLayout } from '@/page-layout/types/PageLayout';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { useLayoutRenderingContext } from '@/ui/layout/contexts/LayoutRenderingContext';
import { isDefined } from 'twenty-shared/utils';
import {
  PageLayoutType,
  WidgetConfigurationType,
  WidgetType,
} from '~/generated/graphql';

const createRelationFieldWidget = (
  field: FieldMetadataItem,
  tabId: string,
): PageLayoutWidget => ({
  __typename: 'PageLayoutWidget' as const,
  id: `dynamic-relation-widget-${field.id}-${field.label}`,
  pageLayoutTabId: tabId,
  title: field.label,
  type: WidgetType.FIELD,
  objectMetadataId: null,
  gridPosition: {
    __typename: 'GridPosition' as const,
    row: 0,
    column: 0,
    rowSpan: 1,
    columnSpan: 12,
  },
  configuration: {
    __typename: 'FieldConfiguration' as const,
    configurationType: WidgetConfigurationType.FIELD,
    fieldMetadataId: field.id,
    layout: 'CARD' as const,
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  deletedAt: null,
});

const createRelationFieldWidgets = (
  relationFields: FieldMetadataItem[],
  tabId: string,
): PageLayoutWidget[] => {
  return relationFields.map((field) => createRelationFieldWidget(field, tabId));
};

const injectRelationWidgetsIntoLayout = (
  layout: PageLayout,
  boxedRelationFieldMetadataItems: FieldMetadataItem[],
): PageLayout => {
  if (boxedRelationFieldMetadataItems.length === 0) {
    return layout;
  }

  const firstTab = layout.tabs[0];
  if (!isDefined(firstTab)) {
    return layout;
  }

  const relationWidgets = createRelationFieldWidgets(
    boxedRelationFieldMetadataItems,
    firstTab.id,
  );

  return {
    ...layout,
    tabs: layout.tabs.map((tab) => {
      if (tab.id === firstTab.id) {
        const firstFieldsWidgetIndex = tab.widgets.findIndex(
          (widget) => widget.type === WidgetType.FIELDS,
        );

        if (firstFieldsWidgetIndex === -1) {
          return {
            ...tab,
            widgets: [...tab.widgets, ...relationWidgets],
          };
        }

        // TODO: This note widget repositioning logic is temporary and will be deleted soon.
        // We need this to ensure the note editor is displayed before record relations,
        // matching the behavior of the old show page.
        const noteWidgetIndex = tab.widgets.findIndex(
          (widget) => widget.type === WidgetType.NOTES,
        );

        const widgetsBeforeRelation = tab.widgets.slice(
          0,
          firstFieldsWidgetIndex + 1,
        );
        const widgetsAfterRelation =
          noteWidgetIndex === -1
            ? tab.widgets.slice(firstFieldsWidgetIndex + 1)
            : [
                ...tab.widgets.slice(
                  firstFieldsWidgetIndex + 1,
                  noteWidgetIndex,
                ),
                ...tab.widgets.slice(noteWidgetIndex + 1),
              ];

        const noteWidget =
          noteWidgetIndex !== -1 ? [tab.widgets[noteWidgetIndex]] : [];

        return {
          ...tab,
          widgets: [
            ...widgetsBeforeRelation,
            ...relationWidgets,
            ...noteWidget,
            ...widgetsAfterRelation,
          ],
        };
      }
      return tab;
    }),
  };
};

export const usePageLayoutWithRelationWidgets = (
  basePageLayout: PageLayout | undefined,
): PageLayout | undefined => {
  const { targetRecordIdentifier, layoutType } = useLayoutRenderingContext();

  const { boxedRelationFieldMetadataItems } = useFieldListFieldMetadataItems({
    objectNameSingular: targetRecordIdentifier?.targetObjectNameSingular ?? '',
  });

  if (!isDefined(basePageLayout)) {
    return undefined;
  }

  const isRecordPage = layoutType === PageLayoutType.RECORD_PAGE;

  if (!isRecordPage) {
    return basePageLayout;
  }

  return injectRelationWidgetsIntoLayout(
    basePageLayout,
    boxedRelationFieldMetadataItems,
  );
};
