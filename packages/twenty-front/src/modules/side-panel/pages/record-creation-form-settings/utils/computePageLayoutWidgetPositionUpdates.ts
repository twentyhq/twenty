import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type RecordFormField } from '@/object-record/record-form/types/RecordFormField';
import { type PageLayoutWidgetUpdate } from '@/page-layout/hooks/useUpdatePageLayoutWidgets';
import { isVerticalListPosition } from '@/page-layout/utils/isVerticalListPosition';
import { isDefined } from 'twenty-shared/utils';
import { PageLayoutTabLayoutMode } from '~/generated-metadata/graphql';

export const computePageLayoutWidgetPositionUpdates = ({
  recordFormFields,
  orderedFieldMetadataIds,
}: {
  recordFormFields: RecordFormField<Pick<FieldMetadataItem, 'id'>>[];
  orderedFieldMetadataIds: string[];
}): PageLayoutWidgetUpdate[] => {
  const recordFormFieldByFieldMetadataId = new Map(
    recordFormFields.map((recordFormField) => [
      recordFormField.fieldMetadataItem.id,
      recordFormField,
    ]),
  );
  const orderedRecordFormFields = orderedFieldMetadataIds
    .map((fieldMetadataId) =>
      recordFormFieldByFieldMetadataId.get(fieldMetadataId),
    )
    .filter(isDefined);
  const orderedFieldMetadataIdSet = new Set(orderedFieldMetadataIds);

  let nextOrderedRecordFormFieldIndex = 0;

  const reorderedRecordFormFields = recordFormFields.map((recordFormField) => {
    if (!orderedFieldMetadataIdSet.has(recordFormField.fieldMetadataItem.id)) {
      return recordFormField;
    }

    const orderedRecordFormField =
      orderedRecordFormFields[nextOrderedRecordFormFieldIndex] ??
      recordFormField;

    nextOrderedRecordFormFieldIndex++;

    return orderedRecordFormField;
  });

  return reorderedRecordFormFields
    .flatMap(({ widgets }) => widgets)
    .flatMap((widget, index) =>
      isDefined(widget.position) &&
      isVerticalListPosition(widget.position) &&
      widget.position.index === index
        ? []
        : [
            {
              widgetId: widget.id,
              position: {
                layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
                index,
              },
            },
          ],
    );
};
