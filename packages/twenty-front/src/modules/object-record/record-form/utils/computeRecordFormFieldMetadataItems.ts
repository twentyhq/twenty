import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type PageLayoutTab } from '@/page-layout/types/PageLayoutTab';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { isDefined } from 'twenty-shared/utils';
import {
  PageLayoutTabLayoutMode,
  WidgetConfigurationType,
  WidgetType,
} from '~/generated-metadata/graphql';

type RecordFormWidget = Pick<
  PageLayoutWidget,
  'isActive' | 'type' | 'position' | 'configuration'
>;

type RecordFormTab = Pick<PageLayoutTab, 'isActive' | 'position'> & {
  widgets?: RecordFormWidget[] | null;
};

type RecordFormLayout = { tabs: RecordFormTab[] };

const getVerticalListIndex = (pageLayoutWidget: RecordFormWidget): number => {
  const { position } = pageLayoutWidget;

  return isDefined(position) &&
    position.layoutMode === PageLayoutTabLayoutMode.VERTICAL_LIST &&
    'index' in position
    ? position.index
    : 0;
};

const getFormFieldMetadataId = (
  pageLayoutWidget: RecordFormWidget,
): string | undefined => {
  const { configuration } = pageLayoutWidget;

  return configuration.configurationType ===
    WidgetConfigurationType.FORM_FIELD && 'fieldMetadataId' in configuration
    ? configuration.fieldMetadataId
    : undefined;
};

export const computeRecordFormFieldMetadataItems = <
  TFieldMetadataItem extends Pick<FieldMetadataItem, 'id'>,
>({
  recordFormPageLayout,
  fieldMetadataItems,
}: {
  recordFormPageLayout: RecordFormLayout;
  fieldMetadataItems: TFieldMetadataItem[];
}): TFieldMetadataItem[] => {
  const fieldMetadataItemById = new Map(
    fieldMetadataItems.map((fieldMetadataItem) => [
      fieldMetadataItem.id,
      fieldMetadataItem,
    ]),
  );

  return [...recordFormPageLayout.tabs]
    .filter((pageLayoutTab) => pageLayoutTab.isActive)
    .sort((tabA, tabB) => tabA.position - tabB.position)
    .flatMap((pageLayoutTab) =>
      [...(pageLayoutTab.widgets ?? [])]
        .filter(
          (pageLayoutWidget) =>
            pageLayoutWidget.isActive &&
            pageLayoutWidget.type === WidgetType.FORM_FIELD,
        )
        .sort(
          (widgetA, widgetB) =>
            getVerticalListIndex(widgetA) - getVerticalListIndex(widgetB),
        ),
    )
    .map((pageLayoutWidget) => {
      const fieldMetadataId = getFormFieldMetadataId(pageLayoutWidget);

      return isDefined(fieldMetadataId)
        ? fieldMetadataItemById.get(fieldMetadataId)
        : undefined;
    })
    .filter(isDefined);
};
