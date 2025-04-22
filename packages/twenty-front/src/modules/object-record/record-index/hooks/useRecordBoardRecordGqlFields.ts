import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { generateDepthOneRecordGqlFields } from '@/object-record/graphql/utils/generateDepthOneRecordGqlFields';
import { generateDepthZeroRecordGqlFields } from '@/object-record/graphql/utils/generateDepthZeroRecordGqlFields';
import { recordGroupFieldMetadataComponentState } from '@/object-record/record-group/states/recordGroupFieldMetadataComponentState';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { isDefined } from 'twenty-shared/utils';

export const useRecordBoardRecordGqlFields = ({
  objectMetadataItem,
  recordBoardId,
}: {
  recordBoardId: string;
  objectMetadataItem: ObjectMetadataItem;
}) => {
  const recordGroupFieldMetadata = useRecoilComponentValueV2(
    recordGroupFieldMetadataComponentState,
    recordBoardId,
  );

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

  if (isDefined(recordGroupFieldMetadata?.name)) {
    recordGqlFields[recordGroupFieldMetadata.name] = true;
  }

  return recordGqlFields;
};
