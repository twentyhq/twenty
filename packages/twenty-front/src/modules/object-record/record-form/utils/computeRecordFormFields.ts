import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { getFieldPermissions } from '@/object-metadata/utils/getFieldPermissions';
import { type RecordFormField } from '@/object-record/record-form/types/RecordFormField';
import { type PageLayoutTab } from '@/page-layout/types/PageLayoutTab';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { type RestrictedFieldsPermissions } from 'twenty-shared/types';
import {
  isDefined,
  isFieldMetadataEligibleForRecordForm,
} from 'twenty-shared/utils';
import {
  PageLayoutTabLayoutMode,
  WidgetConfigurationType,
  WidgetType,
} from '~/generated-metadata/graphql';

type RecordFormWidget = Pick<
  PageLayoutWidget,
  'id' | 'isActive' | 'type' | 'position' | 'configuration'
>;

type RecordFormTab = Pick<PageLayoutTab, 'isActive' | 'position'> & {
  widgets?: RecordFormWidget[] | null;
};

type RecordFormLayout = { tabs: RecordFormTab[] };

type RecordFormFieldMetadataItem = Pick<
  FieldMetadataItem,
  'id' | 'name' | 'type' | 'isActive' | 'isSystem' | 'isUIEditable' | 'settings'
>;

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

const isFieldMetadataItemEligibleForRecordForm = (
  fieldMetadataItem: RecordFormFieldMetadataItem,
): boolean => {
  const { settings } = fieldMetadataItem;

  return isFieldMetadataEligibleForRecordForm({
    fieldName: fieldMetadataItem.name,
    fieldType: fieldMetadataItem.type,
    isActive: fieldMetadataItem.isActive === true,
    isSystem: fieldMetadataItem.isSystem === true,
    isUIEditable: fieldMetadataItem.isUIEditable !== false,
    relationType:
      isDefined(settings) && 'relationType' in settings
        ? settings.relationType
        : undefined,
  });
};

export const computeRecordFormFields = <
  TFieldMetadataItem extends RecordFormFieldMetadataItem,
>({
  recordFormPageLayout,
  fieldMetadataItems,
  restrictedFields,
}: {
  recordFormPageLayout: RecordFormLayout;
  fieldMetadataItems: TFieldMetadataItem[];
  restrictedFields: RestrictedFieldsPermissions;
}): RecordFormField<TFieldMetadataItem>[] => {
  const fieldMetadataItemById = new Map(
    fieldMetadataItems
      .filter(
        (fieldMetadataItem) =>
          isFieldMetadataItemEligibleForRecordForm(fieldMetadataItem) &&
          getFieldPermissions({
            objectPermissions: { restrictedFields },
            fieldMetadataId: fieldMetadataItem.id,
          }).canUpdateField,
      )
      .map((fieldMetadataItem) => [fieldMetadataItem.id, fieldMetadataItem]),
  );

  const recordFormFields = [...recordFormPageLayout.tabs]
    .filter((pageLayoutTab) => pageLayoutTab.isActive)
    .sort((tabA, tabB) => tabA.position - tabB.position)
    .flatMap((pageLayoutTab) =>
      [...(pageLayoutTab.widgets ?? [])]
        .filter(
          (pageLayoutWidget) => pageLayoutWidget.type === WidgetType.FORM_FIELD,
        )
        .sort(
          (widgetA, widgetB) =>
            getVerticalListIndex(widgetA) - getVerticalListIndex(widgetB),
        ),
    )
    .flatMap((pageLayoutWidget) => {
      const fieldMetadataId = getFormFieldMetadataId(pageLayoutWidget);
      const fieldMetadataItem = isDefined(fieldMetadataId)
        ? fieldMetadataItemById.get(fieldMetadataId)
        : undefined;

      return isDefined(fieldMetadataItem)
        ? [
            {
              widgetId: pageLayoutWidget.id,
              fieldMetadataItem,
              isVisible: pageLayoutWidget.isActive,
            },
          ]
        : [];
    });

  const visibleFieldMetadataIds = new Set(
    recordFormFields
      .filter((recordFormField) => recordFormField.isVisible)
      .map((recordFormField) => recordFormField.fieldMetadataItem.id),
  );
  const keptFieldMetadataIds = new Set<string>();

  return recordFormFields.filter(({ fieldMetadataItem, isVisible }) => {
    if (
      keptFieldMetadataIds.has(fieldMetadataItem.id) ||
      (!isVisible && visibleFieldMetadataIds.has(fieldMetadataItem.id))
    ) {
      return false;
    }

    keptFieldMetadataIds.add(fieldMetadataItem.id);

    return true;
  });
};
