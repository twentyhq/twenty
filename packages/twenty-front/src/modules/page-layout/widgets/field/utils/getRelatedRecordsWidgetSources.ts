import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type RelatedRecordsWidgetSource } from '@/page-layout/widgets/field/types/RelatedRecordsWidgetSource';
import { getFieldWidgetAvailableDisplayModes } from '@/page-layout/widgets/field/utils/getFieldWidgetDisplayModeConfig';
import { getFieldWidgetRelationTraversal } from '@/page-layout/widgets/field/utils/getFieldWidgetRelationTraversal';
import { getRecordTableWidgetLayoutDefaultFields } from '@/page-layout/widgets/record-table/utils/getRecordTableWidgetLayoutDefaultFields';
import { isDefined } from 'twenty-shared/utils';
import { FieldDisplayMode } from '~/generated-metadata/graphql';

// System objects (attachments, note targets) come last so a new widget defaults to a business relation.
export const getRelatedRecordsWidgetSources = ({
  fieldMetadataItems,
  objectMetadataItems,
}: {
  fieldMetadataItems: FieldMetadataItem[];
  objectMetadataItems: EnrichedObjectMetadataItem[];
}): RelatedRecordsWidgetSource[] => {
  const objectMetadataItemById = new Map(
    objectMetadataItems.map((objectMetadataItem) => [
      objectMetadataItem.id,
      objectMetadataItem,
    ]),
  );

  const sources = fieldMetadataItems.flatMap((fieldMetadataItem) => {
    const isEmbeddedViewSupported = getFieldWidgetAvailableDisplayModes(
      fieldMetadataItem.type,
      fieldMetadataItem.relation?.type,
    ).includes(FieldDisplayMode.TABLE);

    if (!isEmbeddedViewSupported) {
      return [];
    }

    const {
      targetObjectMetadataId,
      inverseFieldMetadataId,
      relationTargetFieldMetadataId,
    } = getFieldWidgetRelationTraversal({
      sourceFieldMetadataItem: fieldMetadataItem,
      objectMetadataItems,
    });

    const targetObjectMetadataItem = isDefined(targetObjectMetadataId)
      ? objectMetadataItemById.get(targetObjectMetadataId)
      : undefined;

    if (
      !isDefined(targetObjectMetadataItem) ||
      !isDefined(inverseFieldMetadataId)
    ) {
      return [];
    }

    return [
      {
        fieldMetadataItem,
        targetObjectMetadataItem,
        inverseFieldMetadataId,
        relationTargetFieldMetadataId,
        ...getRecordTableWidgetLayoutDefaultFields(targetObjectMetadataItem),
      },
    ];
  });

  return [
    ...sources.filter(
      ({ targetObjectMetadataItem }) => !targetObjectMetadataItem.isSystem,
    ),
    ...sources.filter(
      ({ targetObjectMetadataItem }) => targetObjectMetadataItem.isSystem,
    ),
  ];
};
