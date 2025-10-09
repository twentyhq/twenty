import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { generateDepthRecordGqlFields } from '@/object-record/graphql/utils/generateDepthRecordGqlFields';
import { generateDepthRecordGqlFieldsFromFields } from '@/object-record/graphql/utils/generateDepthRecordGqlFieldsFromFields';
import { visibleRecordFieldsComponentSelector } from '@/object-record/record-field/states/visibleRecordFieldsComponentSelector';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';

export const useRecordsFieldVisibleGqlFields = () => {
  const visibleRecordFields = useRecoilComponentValue(
    visibleRecordFieldsComponentSelector,
  );

  const { fieldMetadataItemByFieldMetadataItemId } =
    useRecordIndexContextOrThrow();

  const { objectMetadataItem: noteTargetObjectMetadataItem } =
    useObjectMetadataItem({
      objectNameSingular: CoreObjectNameSingular.NoteTarget,
    });

  const { objectMetadataItem: taskTargetObjectMetadataItem } =
    useObjectMetadataItem({
      objectNameSingular: CoreObjectNameSingular.TaskTarget,
    });

  const allDepthOneGqlFields = generateDepthRecordGqlFieldsFromFields({
    fields: visibleRecordFields.map(
      (field) =>
        fieldMetadataItemByFieldMetadataItemId[field.fieldMetadataItemId],
    ),
    depth: 1,
  });

  return {
    id: true,
    ...allDepthOneGqlFields,
    noteTargets: generateDepthRecordGqlFields({
      objectMetadataItem: noteTargetObjectMetadataItem,
      depth: 1,
    }),
    taskTargets: generateDepthRecordGqlFields({
      objectMetadataItem: taskTargetObjectMetadataItem,
      depth: 1,
    }),
  };
};
