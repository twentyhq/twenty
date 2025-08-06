import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { generateDepthOneRecordGqlFields } from '@/object-record/graphql/utils/generateDepthOneRecordGqlFields';
import { generateDepthOneWithoutRelationsRecordGqlFields } from '@/object-record/graphql/utils/generateDepthOneWithoutRelationsRecordGqlFields';
import { visibleTableColumnsComponentSelector } from '@/object-record/record-table/states/selectors/visibleTableColumnsComponentSelector';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';

export const useRecordTableRecordGqlFields = ({
  objectMetadataItem,
}: {
  objectMetadataItem: ObjectMetadataItem;
}) => {
  const visibleTableColumns = useRecoilComponentValue(
    visibleTableColumnsComponentSelector,
  );

  const { objectMetadataItem: noteTargetObjectMetadataItem } =
    useObjectMetadataItem({
      objectNameSingular: CoreObjectNameSingular.NoteTarget,
    });

  const { objectMetadataItem: taskTargetObjectMetadataItem } =
    useObjectMetadataItem({
      objectNameSingular: CoreObjectNameSingular.TaskTarget,
    });

  const allDepthOneWithoutRelationsRecordGqlFields =
    generateDepthOneWithoutRelationsRecordGqlFields({
      objectMetadataItem,
    });

  const recordGqlFields: Record<string, any> = {
    ...allDepthOneWithoutRelationsRecordGqlFields,
    ...Object.fromEntries(
      visibleTableColumns.map((column) => [column.metadata.fieldName, true]),
    ),
    noteTargets: generateDepthOneRecordGqlFields({
      objectMetadataItem: noteTargetObjectMetadataItem,
    }),
    taskTargets: generateDepthOneRecordGqlFields({
      objectMetadataItem: taskTargetObjectMetadataItem,
    }),
  };

  return recordGqlFields;
};
