import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { WIDGET_TYPE_TO_RELATION_FIELD_NAME } from '@/page-layout/constants/WidgetTypeToRelationFieldName';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

// A widget tab maps to a standard relation field (e.g. Tasks -> taskTargets).
// Such a tab must be hidden when its relation is either deactivated or fully
// removed from the object: a removed field is simply absent from `fields`, so
// we treat any widget relation field that is not currently active as unavailable.
export const getUnavailableWidgetRelationFieldNames = (
  fields: Pick<FieldMetadataItem, 'name' | 'isActive' | 'type'>[],
): Set<string> => {
  const activeRelationFieldNames = new Set(
    fields
      .filter(
        (field) =>
          field.isActive &&
          (field.type === FieldMetadataType.RELATION ||
            field.type === FieldMetadataType.MORPH_RELATION),
      )
      .map((field) => field.name),
  );

  const widgetRelationFieldNames = Object.values(
    WIDGET_TYPE_TO_RELATION_FIELD_NAME,
  ).filter(isDefined);

  return new Set(
    widgetRelationFieldNames.filter(
      (fieldName) => !activeRelationFieldNames.has(fieldName),
    ),
  );
};
