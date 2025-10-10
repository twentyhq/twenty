import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { generateDepthRecordGqlFieldsFromFields } from '@/object-record/graphql/record-gql-fields/utils/generateDepthRecordGqlFieldsFromFields';
import { generateDepthRecordGqlFieldsFromObject } from '@/object-record/graphql/record-gql-fields/utils/generateDepthRecordGqlFieldsFromObject';
import { visibleRecordFieldsComponentSelector } from '@/object-record/record-field/states/visibleRecordFieldsComponentSelector';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';

export const useRecordsFieldVisibleGqlFields = () => {
  const visibleRecordFields = useRecoilComponentValue(
    visibleRecordFieldsComponentSelector,
  );

  const { fieldMetadataItemByFieldMetadataItemId } =
    useRecordIndexContextOrThrow();

  const { objectMetadataItems } = useObjectMetadataItems();
  const { objectMetadataItem: noteTargetObjectMetadataItem } =
    useObjectMetadataItem({
      objectNameSingular: CoreObjectNameSingular.NoteTarget,
    });

  const { objectMetadataItem: taskTargetObjectMetadataItem } =
    useObjectMetadataItem({
      objectNameSingular: CoreObjectNameSingular.TaskTarget,
    });

  const allDepthOneGqlFields = generateDepthRecordGqlFieldsFromFields({
    objectMetadataItems,
    fields: visibleRecordFields.map(
      (field) =>
        fieldMetadataItemByFieldMetadataItemId[field.fieldMetadataItemId],
    ),
    depth: 1,
  });

  return {
    id: true,
    ...allDepthOneGqlFields,
    noteTargets: generateDepthRecordGqlFieldsFromObject({
      objectMetadataItem: noteTargetObjectMetadataItem,
      objectMetadataItems,
      depth: 1,
    }),
    taskTargets: generateDepthRecordGqlFieldsFromObject({
      objectMetadataItems,
      objectMetadataItem: taskTargetObjectMetadataItem,
      depth: 1,
    }),
  };
};
