import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type RecordFormField } from '@/object-record/record-form/types/RecordFormField';
import { type PageLayoutWidgetUpdate } from '@/page-layout/hooks/useUpdatePageLayoutWidgets';
import { isDefined } from 'twenty-shared/utils';

export const computePageLayoutWidgetIsActiveUpdates = ({
  recordFormFields,
  isVisibleByFieldMetadataId,
}: {
  recordFormFields: RecordFormField<Pick<FieldMetadataItem, 'id'>>[];
  isVisibleByFieldMetadataId: Record<string, boolean>;
}): PageLayoutWidgetUpdate[] =>
  recordFormFields.flatMap(({ fieldMetadataItem, widgets, isVisible }) => {
    const isActive = isVisibleByFieldMetadataId[fieldMetadataItem.id];

    if (!isDefined(isActive) || isActive === isVisible) {
      return [];
    }

    return widgets
      .filter((widget) => widget.isActive !== isActive)
      .map((widget) => ({ widgetId: widget.id, isActive }));
  });
