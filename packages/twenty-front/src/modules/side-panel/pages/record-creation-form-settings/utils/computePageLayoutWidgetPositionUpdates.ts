import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type RecordFormField } from '@/object-record/record-form/types/RecordFormField';
import { type PageLayoutWidgetUpdate } from '@/page-layout/hooks/useUpdatePageLayoutWidgets';
import { isVerticalListPosition } from '@/page-layout/utils/isVerticalListPosition';
import { isDefined } from 'twenty-shared/utils';
import { PageLayoutTabLayoutMode } from '~/generated-metadata/graphql';

export const computePageLayoutWidgetPositionUpdates = ({
  recordFormFields,
  reorderedRecordFormFields,
}: {
  recordFormFields: RecordFormField<Pick<FieldMetadataItem, 'id'>>[];
  reorderedRecordFormFields: RecordFormField<Pick<FieldMetadataItem, 'id'>>[];
}): PageLayoutWidgetUpdate[] => {
  const reorderedFieldMetadataIds = new Set(
    reorderedRecordFormFields.map(
      ({ fieldMetadataItem }) => fieldMetadataItem.id,
    ),
  );
  const reorderedSlotIndexes = recordFormFields.flatMap(
    ({ fieldMetadataItem }, slotIndex) =>
      reorderedFieldMetadataIds.has(fieldMetadataItem.id) ? [slotIndex] : [],
  );
  const recordFormFieldsInNewOrder = [...recordFormFields];

  reorderedRecordFormFields.forEach((recordFormField, orderIndex) => {
    const slotIndex = reorderedSlotIndexes[orderIndex];

    if (isDefined(slotIndex)) {
      recordFormFieldsInNewOrder[slotIndex] = recordFormField;
    }
  });

  return recordFormFieldsInNewOrder
    .flatMap(({ widgets }) => widgets)
    .flatMap((widget, index) => {
      const verticalListPosition =
        isDefined(widget.position) && isVerticalListPosition(widget.position)
          ? widget.position
          : undefined;

      if (verticalListPosition?.index === index) {
        return [];
      }

      return [
        {
          widgetId: widget.id,
          position: {
            layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
            index,
            ...(isDefined(verticalListPosition?.heightBehavior)
              ? { heightBehavior: verticalListPosition.heightBehavior }
              : {}),
          },
        },
      ];
    });
};
