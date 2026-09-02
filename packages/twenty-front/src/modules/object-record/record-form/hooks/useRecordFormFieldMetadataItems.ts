import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { recordFormPageLayoutByObjectMetadataIdFamilySelector } from '@/page-layout/states/selectors/recordFormPageLayoutByObjectMetadataIdFamilySelector';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { isDefined } from 'twenty-shared/utils';
import {
  PageLayoutTabLayoutMode,
  WidgetConfigurationType,
  WidgetType,
} from '~/generated-metadata/graphql';

const getVerticalListIndex = (pageLayoutWidget: PageLayoutWidget): number => {
  const { position } = pageLayoutWidget;

  return isDefined(position) &&
    position.layoutMode === PageLayoutTabLayoutMode.VERTICAL_LIST &&
    'index' in position
    ? position.index
    : 0;
};

export const useRecordFormFieldMetadataItems = ({
  objectMetadataItem,
}: {
  objectMetadataItem: EnrichedObjectMetadataItem;
}): { recordFormFieldMetadataItems: FieldMetadataItem[] } => {
  const recordFormPageLayout = useAtomFamilySelectorValue(
    recordFormPageLayoutByObjectMetadataIdFamilySelector,
    { objectMetadataId: objectMetadataItem.id },
  );

  if (!isDefined(recordFormPageLayout)) {
    return { recordFormFieldMetadataItems: [] };
  }

  const fieldMetadataItemById = new Map(
    objectMetadataItem.fields.map((fieldMetadataItem: FieldMetadataItem) => [
      fieldMetadataItem.id,
      fieldMetadataItem,
    ]),
  );

  const recordFormFieldMetadataItems = recordFormPageLayout.tabs
    .filter((pageLayoutTab) => pageLayoutTab.isActive)
    .flatMap((pageLayoutTab) => pageLayoutTab.widgets ?? [])
    .filter(
      (pageLayoutWidget) =>
        pageLayoutWidget.isActive &&
        pageLayoutWidget.type === WidgetType.FORM_FIELD,
    )
    .sort(
      (widgetA, widgetB) =>
        getVerticalListIndex(widgetA) - getVerticalListIndex(widgetB),
    )
    .map(({ configuration }) =>
      configuration.configurationType === WidgetConfigurationType.FORM_FIELD &&
      'fieldMetadataId' in configuration &&
      isDefined(configuration.fieldMetadataId)
        ? fieldMetadataItemById.get(configuration.fieldMetadataId)
        : undefined,
    )
    .filter(isDefined);

  return { recordFormFieldMetadataItems };
};
