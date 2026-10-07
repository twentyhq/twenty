import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type FieldMetadataItemRelation } from '@/object-metadata/types/FieldMetadataItemRelation';
import { type RecordFormField } from '@/object-record/record-form/types/RecordFormField';
import { type PageLayoutTab } from '@/page-layout/types/PageLayoutTab';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import groupBy from 'lodash.groupby';
import uniqBy from 'lodash.uniqby';
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
> & {
  morphRelations?:
    | Pick<FieldMetadataItemRelation, 'sourceFieldMetadata'>[]
    | null;
};

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
): boolean =>
  isFieldMetadataEligibleForRecordForm({
    fieldName: fieldMetadataItem.name,
    fieldType: fieldMetadataItem.type,
    isActive: fieldMetadataItem.isActive === true,
    isSystem: fieldMetadataItem.isSystem === true,
    isUIEditable: fieldMetadataItem.isUIEditable !== false,
    relationType: fieldMetadataItem.settings?.relationType,
  });

export const computeRecordFormFields = <
  TFieldMetadataItem extends RecordFormFieldMetadataItem,
>({
  recordFormPageLayout,
  fieldMetadataItems,
}: {
  recordFormPageLayout: RecordFormLayout;
  fieldMetadataItems: TFieldMetadataItem[];
}): RecordFormField<TFieldMetadataItem>[] => {
  const fieldMetadataItemByFormFieldMetadataId = new Map<
    string,
    TFieldMetadataItem
  >();

  for (const fieldMetadataItem of fieldMetadataItems) {
    const formFieldMetadataIds = [
      fieldMetadataItem.id,
      ...(fieldMetadataItem.morphRelations ?? []).map(
        (morphRelation) => morphRelation.sourceFieldMetadata.id,
      ),
    ];

    for (const formFieldMetadataId of formFieldMetadataIds) {
      if (!fieldMetadataItemByFormFieldMetadataId.has(formFieldMetadataId)) {
        fieldMetadataItemByFormFieldMetadataId.set(
          formFieldMetadataId,
          fieldMetadataItem,
        );
      }
    }
  }

  const formFieldWidgetEntries = [...recordFormPageLayout.tabs]
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
      const formFieldMetadataId = getFormFieldMetadataId(pageLayoutWidget);
      const fieldMetadataItem = isDefined(formFieldMetadataId)
        ? fieldMetadataItemByFormFieldMetadataId.get(formFieldMetadataId)
        : undefined;

      return isDefined(fieldMetadataItem)
        ? [{ pageLayoutWidget, fieldMetadataItem }]
        : [];
    });

  const formFieldWidgetEntriesByFieldMetadataId = groupBy(
    formFieldWidgetEntries,
    ({ fieldMetadataItem }) => fieldMetadataItem.id,
  );

  const visibleFieldMetadataIds = new Set(
    formFieldWidgetEntries
      .filter(({ pageLayoutWidget }) => pageLayoutWidget.isActive)
      .map(({ fieldMetadataItem }) => fieldMetadataItem.id),
  );

  return uniqBy(
    formFieldWidgetEntries.filter(
      ({ pageLayoutWidget, fieldMetadataItem }) =>
        pageLayoutWidget.isActive ||
        !visibleFieldMetadataIds.has(fieldMetadataItem.id),
    ),
    ({ fieldMetadataItem }) => fieldMetadataItem.id,
  )
    .map(({ pageLayoutWidget, fieldMetadataItem }) => ({
      fieldMetadataItem,
      widgets: formFieldWidgetEntriesByFieldMetadataId[
        fieldMetadataItem.id
      ].map((formFieldWidgetEntry) => formFieldWidgetEntry.pageLayoutWidget),
      isVisible: pageLayoutWidget.isActive,
    }))
    .filter(
      ({ fieldMetadataItem, isVisible }) =>
        isVisible ||
        isFieldMetadataItemEligibleForRecordForm(fieldMetadataItem),
    );
};
