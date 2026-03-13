import { Command } from '@/command-menu-item/display/components/Command';
import { useSelectedRecordIdOrThrow } from '@/command-menu-item/record/single-record/hooks/useSelectedRecordIdOrThrow';
import { useOpenRecordInSidePanel } from '@/side-panel/hooks/useOpenRecordInSidePanel';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { type FieldMetadataItemRelation } from '@/object-metadata/types/FieldMetadataItemRelation';
import { useCreateOneRecord } from '@/object-record/hooks/useCreateOneRecord';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { getForeignKeyNameFromRelationFieldName } from '@/object-record/utils/getForeignKeyNameFromRelationFieldName';

interface CreateRelatedRecordCommandProps {
  targetFieldMetadataItemRelation: FieldMetadataItemRelation;
}

export const CreateRelatedRecordCommand = ({
  targetFieldMetadataItemRelation,
}: CreateRelatedRecordCommandProps) => {
  const sourceRecordId = useSelectedRecordIdOrThrow();

  const { objectMetadataItem: targetObjectMetadataItem } =
    useObjectMetadataItem({
      objectNameSingular:
        targetFieldMetadataItemRelation.targetObjectMetadata.nameSingular,
    });

  const { objectMetadataItem: taskObjectMetadataItem } = useObjectMetadataItem({
    objectNameSingular: CoreObjectNameSingular.Task,
  });

  const { objectMetadataItem: noteObjectMetadataItem } = useObjectMetadataItem({
    objectNameSingular: CoreObjectNameSingular.Note,
  });

  const { openRecordInSidePanel } = useOpenRecordInSidePanel();

  const { createOneRecord: createOneTaskTarget } = useCreateOneRecord({
    objectNameSingular: CoreObjectNameSingular.TaskTarget,
  });

  const { createOneRecord: createOneNoteTarget } = useCreateOneRecord({
    objectNameSingular: CoreObjectNameSingular.NoteTarget,
  });

  const targetObject =
    targetObjectMetadataItem.nameSingular === CoreObjectNameSingular.TaskTarget
      ? taskObjectMetadataItem
      : targetObjectMetadataItem.nameSingular ===
          CoreObjectNameSingular.NoteTarget
        ? noteObjectMetadataItem
        : targetObjectMetadataItem;

  const { createOneRecord } = useCreateOneRecord({
    objectNameSingular: targetObject.nameSingular,
  });

  const handleCreateRelatedRecord = async () => {
    const foreignKeyFieldName =
      targetFieldMetadataItemRelation.targetFieldMetadata.name;
    const foreignKeyIdFieldName =
      getForeignKeyNameFromRelationFieldName(foreignKeyFieldName);

    let createdRecord: ObjectRecord;

    switch (targetObjectMetadataItem.nameSingular) {
      case CoreObjectNameSingular.TaskTarget: {
        createdRecord = await createOneRecord({});

        await createOneTaskTarget({
          taskId: createdRecord.id,
          [foreignKeyIdFieldName]: sourceRecordId,
        });
        break;
      }
      case CoreObjectNameSingular.NoteTarget: {
        createdRecord = await createOneRecord({});

        await createOneNoteTarget({
          noteId: createdRecord.id,
          [foreignKeyIdFieldName]: sourceRecordId,
        });
        break;
      }
      default:
        createdRecord = await createOneRecord({
          [foreignKeyIdFieldName]: sourceRecordId,
        });
        break;
    }

    openRecordInSidePanel({
      recordId: createdRecord.id,
      objectNameSingular: targetObject.nameSingular,
      isNewRecord: true,
    });
  };

  return (
    <Command
      onClick={handleCreateRelatedRecord}
      closeSidePanelOnCommandMenuListExecution={false}
    />
  );
};
