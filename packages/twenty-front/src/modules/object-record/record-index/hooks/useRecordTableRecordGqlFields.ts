import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { generateDepthOneRecordGqlFields } from '@/object-record/graphql/utils/generateDepthOneRecordGqlFields';
import { generateDepthZeroRecordGqlFields } from '@/object-record/graphql/utils/generateDepthZeroRecordGqlFields';

export const useRecordTableRecordGqlFields = ({
  objectMetadataItem,
}: {
  objectMetadataItem: ObjectMetadataItem;
}) => {
  const { objectMetadataItem: noteTargetObjectMetadataItem } =
    useObjectMetadataItem({
      objectNameSingular: CoreObjectNameSingular.NoteTarget,
    });

  const { objectMetadataItem: taskTargetObjectMetadataItem } =
    useObjectMetadataItem({
      objectNameSingular: CoreObjectNameSingular.TaskTarget,
    });

  const allDepthZeroRecordGqlFields = generateDepthZeroRecordGqlFields({
    objectMetadataItem,
  });

  const recordGqlFields: Record<string, any> = {
    ...allDepthZeroRecordGqlFields,
    noteTargets: generateDepthOneRecordGqlFields({
      objectMetadataItem: noteTargetObjectMetadataItem,
    }),
    taskTargets: generateDepthOneRecordGqlFields({
      objectMetadataItem: taskTargetObjectMetadataItem,
    }),
  };

  return recordGqlFields;
};
