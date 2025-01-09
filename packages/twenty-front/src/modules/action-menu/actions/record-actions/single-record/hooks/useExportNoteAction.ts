import { useSelectedRecordIdOrThrow } from '@/action-menu/actions/record-actions/single-record/hooks/useSelectedRecordIdOrThrow';
import { ActionHookWithObjectMetadataItem } from '@/action-menu/actions/types/ActionHook';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { BlockNoteEditor } from '@blocknote/core';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-ui';

export const useExportNoteAction: ActionHookWithObjectMetadataItem = ({
  objectMetadataItem,
}) => {
  const recordId = useSelectedRecordIdOrThrow();

  const selectedRecord = useRecoilValue(recordStoreFamilyState(recordId));

  const filename = `${(selectedRecord?.title || 'Untitled Note').replace(/[<>:"/\\|?*]/g, '-')}`;

  const isNoteOrTask =
    objectMetadataItem?.nameSingular === CoreObjectNameSingular.Note ||
    objectMetadataItem?.nameSingular === CoreObjectNameSingular.Task;

  const shouldBeRegistered =
    isDefined(objectMetadataItem) && isDefined(selectedRecord) && isNoteOrTask;

  const onClick = async () => {
    if (!shouldBeRegistered || !selectedRecord?.body) {
      return;
    }

    const editor = await BlockNoteEditor.create({
      initialContent: JSON.parse(selectedRecord.body),
    });

    const { exportBlockNoteEditorToPdf } = await import(
      '@/action-menu/actions/record-actions/single-record/utils/exportBlockNoteEditorToPdf'
    );

    await exportBlockNoteEditorToPdf(editor, filename);

    // TODO later: implement DOCX export
    // const { exportBlockNoteEditorToDocx } = await import(
    //   '@/action-menu/actions/record-actions/single-record/utils/exportBlockNoteEditorToDocx'
    // );
    // await exportBlockNoteEditorToDocx(editor, filename);
  };

  return {
    shouldBeRegistered,
    onClick,
  };
};
