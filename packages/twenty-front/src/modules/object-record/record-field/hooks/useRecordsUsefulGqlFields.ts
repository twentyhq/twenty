import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { getImageIdentifierFieldMetadataItem } from '@/object-metadata/utils/getImageIdentifierFieldMetadataItem';
import { getLabelIdentifierFieldMetadataItem } from '@/object-metadata/utils/getLabelIdentifierFieldMetadataItem';
import { hasObjectMetadataItemPositionField } from '@/object-metadata/utils/hasObjectMetadataItemPositionField';
import { generateActivityTargetGqlFields } from '@/object-record/graphql/record-gql-fields/utils/generateActivityTargetGqlFields';

import { generateDepthRecordGqlFieldsFromFields } from '@/object-record/graphql/record-gql-fields/utils/generateDepthRecordGqlFieldsFromFields';
import { visibleRecordFieldsComponentSelector } from '@/object-record/record-field/states/visibleRecordFieldsComponentSelector';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { filterDuplicatesById, isDefined } from 'twenty-shared/utils';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

type UseRecordsUsefulGqlFields = {
  objectMetadataItem: ObjectMetadataItem;
  additionalFieldMetadataId?: string | null;
};

export const useRecordsUsefulGqlFields = ({
  objectMetadataItem,
  additionalFieldMetadataId,
}: UseRecordsUsefulGqlFields) => {
  const visibleRecordFields = useRecoilComponentValue(
    visibleRecordFieldsComponentSelector,
  );

  const currentRecordFilters = useRecoilComponentValue(
    currentRecordFiltersComponentState,
  );

  const { fieldMetadataItemByFieldMetadataItemId } =
    useRecordIndexContextOrThrow();

  const { objectMetadataItems } = useObjectMetadataItems();

  const isFilesFieldMigrated = useIsFeatureEnabled(
    FeatureFlagKey.IS_FILES_FIELD_MIGRATED,
  );

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

  const fieldMetadataItemsToUse = [
    ...visibleRecordFieldMetadataItems,
    ...(recordFilterFields ?? []),
  ].filter(filterDuplicatesById);

  const allDepthOneGqlFields = generateDepthRecordGqlFieldsFromFields({
    objectMetadataItems,
    fields: fieldMetadataItemsToUse,
    depth: 1,
    isFilesFieldMigrated,
  });

  const labelIdentifierFieldMetadataItem =
    getLabelIdentifierFieldMetadataItem(objectMetadataItem);
  const imageIdentifierFieldMetadataItem = getImageIdentifierFieldMetadataItem(
    objectMetadataItem,
    isFilesFieldMigrated,
  );

  const hasPosition = hasObjectMetadataItemPositionField(objectMetadataItem);

  const additionalFieldMetadataItem = isDefined(additionalFieldMetadataId)
    ? fieldMetadataItemByFieldMetadataItemId[additionalFieldMetadataId]
    : undefined;

  const isObjectAnActivity =
    objectMetadataItem.nameSingular === CoreObjectNameSingular.Note ||
    objectMetadataItem.nameSingular === CoreObjectNameSingular.Task;

  return {
    id: true,
    ...(isDefined(additionalFieldMetadataItem)
      ? { [additionalFieldMetadataItem.name]: true }
      : {}),
    ...(isDefined(labelIdentifierFieldMetadataItem)
      ? { [labelIdentifierFieldMetadataItem.name]: true }
      : {}),
    ...(isDefined(imageIdentifierFieldMetadataItem)
      ? { [imageIdentifierFieldMetadataItem.name]: true }
      : {}),
    ...(hasPosition ? { position: true } : {}),
    ...allDepthOneGqlFields,
    createdAt: true,
    updatedAt: true,
    deletedAt: true,
    noteTargets: generateActivityTargetGqlFields({
      activityObjectNameSingular: CoreObjectNameSingular.Note,
      objectMetadataItems,
      loadRelations: isObjectAnActivity ? 'relations' : 'activity',
    }),
    taskTargets: generateActivityTargetGqlFields({
      activityObjectNameSingular: CoreObjectNameSingular.Task,
      objectMetadataItems,
      loadRelations: isObjectAnActivity ? 'relations' : 'activity',
    }),
  };
};
