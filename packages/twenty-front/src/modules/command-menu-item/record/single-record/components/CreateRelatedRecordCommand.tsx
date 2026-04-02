import { Command } from '@/command-menu-item/display/components/Command';
import { useSelectedRecordIdOrThrow } from '@/command-menu-item/record/single-record/hooks/useSelectedRecordIdOrThrow';
import { useOpenRecordInSidePanel } from '@/side-panel/hooks/useOpenRecordInSidePanel';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { type FieldMetadataItemRelation } from '@/object-metadata/types/FieldMetadataItemRelation';
import { useCreateOneRecord } from '@/object-record/hooks/useCreateOneRecord';
import { draftRecordIdsState } from '@/object-record/record-side-panel/states/draftRecordIdsState';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { getForeignKeyNameFromRelationFieldName } from '@/object-record/utils/getForeignKeyNameFromRelationFieldName';
import { useStore } from 'jotai';
import { v4 } from 'uuid';

interface CreateRelatedRecordCommandProps {
  targetFieldMetadataItemRelation: FieldMetadataItemRelation;
}

export const CreateRelatedRecordCommand = ({
  targetFieldMetadataItemRelation,
}: CreateRelatedRecordCommandProps) => {
  const sourceRecordId = useSelectedRecordIdOrThrow();
  const store = useStore();

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

  const foreignKeyFieldName =
    targetFieldMetadataItemRelation.targetFieldMetadata.name;
  const foreignKeyIdFieldName =
    getForeignKeyNameFromRelationFieldName(foreignKeyFieldName);

  const handleCreateRelatedRecord = () => {
    const newRecordId = v4();

    const isTaskTarget =
      targetObjectMetadataItem.nameSingular ===
      CoreObjectNameSingular.TaskTarget;
    const isNoteTarget =
      targetObjectMetadataItem.nameSingular ===
      CoreObjectNameSingular.NoteTarget;

    const seedValues: Record<string, unknown> = { id: newRecordId };
    if (!isTaskTarget && !isNoteTarget) {
      seedValues[foreignKeyIdFieldName] = sourceRecordId;
    }

    // Seed draft in record store
    store.set(
      recordStoreFamilyState.atomFamily(newRecordId),
      seedValues as ObjectRecord,
    );

    // Track as draft
    const draftMap = new Map(store.get(draftRecordIdsState.atom));
    draftMap.set(newRecordId, {
      objectNameSingular: targetObject.nameSingular,
      objectMetadataItem: targetObject,
      hiddenFieldNames: new Set(['position']),
      extraRecordInput: {},
      onRecordCreated: async (createdRecord) => {
        if (isTaskTarget) {
          await createOneTaskTarget({
            taskId: createdRecord.id,
            [foreignKeyIdFieldName]: sourceRecordId,
          });
        } else if (isNoteTarget) {
          await createOneNoteTarget({
            noteId: createdRecord.id,
            [foreignKeyIdFieldName]: sourceRecordId,
          });
        }

        openRecordInSidePanel({
          recordId: createdRecord.id,
          objectNameSingular: targetObject.nameSingular,
          isNewRecord: true,
        });
      },
    });
    store.set(draftRecordIdsState.atom, draftMap);

    // Open side panel with draft
    openRecordInSidePanel({
      recordId: newRecordId,
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
