import { Action } from '@/action-menu/actions/components/Action';
import { useSelectedRecordIdOrThrow } from '@/action-menu/actions/record-actions/single-record/hooks/useSelectedRecordIdOrThrow';
import { useOpenRecordInCommandMenu } from '@/command-menu/hooks/useOpenRecordInCommandMenu';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { type FieldMetadataItemRelation } from '@/object-metadata/types/FieldMetadataItemRelation';
import { getLabelIdentifierFieldMetadataItem } from '@/object-metadata/utils/getLabelIdentifierFieldMetadataItem';
import { useCreateOneRecord } from '@/object-record/hooks/useCreateOneRecord';
import { useRecordTitleCell } from '@/object-record/record-title-cell/hooks/useRecordTitleCell';
import { RecordTitleCellContainerType } from '@/object-record/record-title-cell/types/RecordTitleCellContainerType';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { getForeignKeyNameFromRelationFieldName } from '@/object-record/utils/getForeignKeyNameFromRelationFieldName';
import { getRecordFieldInputInstanceId } from '@/object-record/utils/getRecordFieldInputId';
import { isDefined } from 'twenty-shared/utils';

interface CreateRelatedRecordActionProps {
  targetFieldMetadataItemRelation: FieldMetadataItemRelation;
}

export const CreateRelatedRecordAction = ({
  targetFieldMetadataItemRelation,
}: CreateRelatedRecordActionProps) => {
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

  const { openRecordInCommandMenu } = useOpenRecordInCommandMenu();

  const { createOneRecord: createOneTaskTarget } = useCreateOneRecord({
    objectNameSingular: CoreObjectNameSingular.TaskTarget,
  });

  const { createOneRecord: createOneNoteTarget } = useCreateOneRecord({
    objectNameSingular: CoreObjectNameSingular.NoteTarget,
  });

  const { openRecordTitleCell } = useRecordTitleCell();

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

    openRecordInCommandMenu({
      recordId: createdRecord.id,
      objectNameSingular: targetObject.nameSingular,
      isNewRecord: true,
    });

    const labelIdentifierFieldMetadataItem =
      getLabelIdentifierFieldMetadataItem(targetObject);

    if (isDefined(labelIdentifierFieldMetadataItem)) {
      openRecordTitleCell({
        recordId: createdRecord.id,
        fieldName: labelIdentifierFieldMetadataItem.name,
        instanceId: getRecordFieldInputInstanceId({
          recordId: createdRecord.id,
          fieldName: labelIdentifierFieldMetadataItem.name,
          prefix: RecordTitleCellContainerType.ShowPage,
        }),
      });
    }
  };

  return (
    <Action
      onClick={handleCreateRelatedRecord}
      closeSidePanelOnCommandMenuListActionExecution={false}
    />
  );
};
