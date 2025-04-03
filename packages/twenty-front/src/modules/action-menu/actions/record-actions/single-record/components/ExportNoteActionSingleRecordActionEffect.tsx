import { useSelectedRecordIdOrThrow } from '@/action-menu/actions/record-actions/single-record/hooks/useSelectedRecordIdOrThrow';
import { useActionEffect } from '@/action-menu/hooks/useActionEffect';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { BlockNoteEditor } from '@blocknote/core';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared/utils';

export const ExportNoteActionSingleRecordActionEffect = () => {
  const recordId = useSelectedRecordIdOrThrow();

  const selectedRecord = useRecoilValue(recordStoreFamilyState(recordId));

  const filename = `${(selectedRecord?.title || 'Untitled Note').replace(/[<>:"/\\|?*]/g, '-')}`;

  useActionEffect(() => {
    const exportNote = async () => {
      if (!isDefined(selectedRecord)) {
        return;
      }

      const initialBody = selectedRecord.bodyV2?.blocknote;

      let parsedBody = [];

      // TODO: Remove this once we have removed the old rich text
      try {
        parsedBody = JSON.parse(initialBody);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.warn(
          `Failed to parse body for record ${recordId}, for rich text version 'v2'`,
        );
        // eslint-disable-next-line no-console
        console.warn(initialBody);
      }

      const editor = BlockNoteEditor.create({
        initialContent: parsedBody,
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

    exportNote();
  }, [filename, recordId, selectedRecord]);

  return null;
};
