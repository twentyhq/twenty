import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { getImageIdentifierFieldMetadataItem } from '@/object-metadata/utils/getImageIdentifierFieldMetadataItem';
import { getLabelIdentifierFieldMetadataItem } from '@/object-metadata/utils/getLabelIdentifierFieldMetadataItem';
import { hasObjectMetadataItemPositionField } from '@/object-metadata/utils/hasObjectMetadataItemPositionField';
import { generateDepthRecordGqlFieldsFromFields } from '@/object-record/graphql/record-gql-fields/utils/generateDepthRecordGqlFieldsFromFields';
import { getReverseJunctionConfig } from '@/object-record/record-field/ui/utils/junction/getReverseJunctionConfig';
import { isJunctionRelationField } from '@/object-record/record-field/ui/utils/junction/isJunctionRelationField';
import { visibleRecordFieldsComponentSelector } from '@/object-record/record-field/states/visibleRecordFieldsComponentSelector';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';

import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { filterDuplicatesById, isDefined } from 'twenty-shared/utils';

type UseRecordsUsefulGqlFields = {
  objectMetadataItem: EnrichedObjectMetadataItem;
  additionalFieldMetadataIds?: Array<string | null | undefined>;
};

export const useRelevantRecordsGqlFields = ({
  objectMetadataItem,
  additionalFieldMetadataIds = [],
}: UseRecordsUsefulGqlFields) => {
  const visibleRecordFields = useAtomComponentSelectorValue(
    visibleRecordFieldsComponentSelector,
  );

  const currentRecordFilters = useAtomComponentStateValue(
    currentRecordFiltersComponentState,
  );

  const { fieldMetadataItemByFieldMetadataItemId } =
    useRecordIndexContextOrThrow();

  const { objectMetadataItems } = useObjectMetadataItems();

  const visibleRecordFieldMetadataItems = visibleRecordFields
    .map(
      (field) =>
        fieldMetadataItemByFieldMetadataItemId[field.fieldMetadataItemId],
    )
    .filter(isDefined);

  const recordFilterFields = currentRecordFilters
    .map((recordFilter) =>
      objectMetadataItem.fields.find(
        (field) => field.id === recordFilter.fieldMetadataId,
      ),
    )
    .filter(isDefined);

  const additionalFieldMetadataItems = additionalFieldMetadataIds
    .filter(isDefined)
    .map(
      (fieldMetadataId) =>
        fieldMetadataItemByFieldMetadataItemId[fieldMetadataId],
    )
    .filter(isDefined);

  const fieldMetadataItemsToUse = [
    ...visibleRecordFieldMetadataItems,
    ...(recordFilterFields ?? []),
    ...additionalFieldMetadataItems,
  ].filter(filterDuplicatesById);

  const allDepthOneGqlFields = generateDepthRecordGqlFieldsFromFields({
    objectMetadataItems,
    fields: fieldMetadataItemsToUse,
    depth: 1,
  });

  const junctionRelationFields = objectMetadataItem.fields.filter(
    (fieldMetadataItem) =>
      isJunctionRelationField(fieldMetadataItem) ||
      isDefined(
        getReverseJunctionConfig({
          junctionObjectMetadataId:
            fieldMetadataItem.relation?.targetObjectMetadata.id,
          sourceObjectMetadataId: objectMetadataItem.id,
          objectMetadataItems,
        }),
      ),
  );

  const junctionRelationGqlFields = generateDepthRecordGqlFieldsFromFields({
    objectMetadataItems,
    fields: junctionRelationFields,
    depth: 1,
  });

  const labelIdentifierFieldMetadataItem =
    getLabelIdentifierFieldMetadataItem(objectMetadataItem);
  const imageIdentifierFieldMetadataItem =
    getImageIdentifierFieldMetadataItem(objectMetadataItem);

  const hasPosition = hasObjectMetadataItemPositionField(objectMetadataItem);

  return {
    id: true,
    ...(isDefined(labelIdentifierFieldMetadataItem)
      ? { [labelIdentifierFieldMetadataItem.name]: true }
      : {}),
    ...(isDefined(imageIdentifierFieldMetadataItem)
      ? { [imageIdentifierFieldMetadataItem.name]: true }
      : {}),
    ...(hasPosition ? { position: true } : {}),
    ...junctionRelationGqlFields,
    ...allDepthOneGqlFields,
    createdAt: true,
    updatedAt: true,
    deletedAt: true,
  };
};
