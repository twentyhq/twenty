import { Action } from '@/action-menu/actions/components/Action';
import { useSelectedRecordIdOrThrow } from '@/action-menu/actions/record-actions/single-record/hooks/useSelectedRecordIdOrThrow';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared/utils';

export const ExportNoteActionSingleRecordAction = () => {
  const recordId = useSelectedRecordIdOrThrow();

  const selectedRecord = useRecoilValue(recordStoreFamilyState(recordId));

  const filename = `${(selectedRecord?.title || 'Untitled Note').replace(/[<>:"/\\|?*]/g, '-')}`;

  const handleClick = async () => {
    if (!isDefined(selectedRecord)) {
      return;
    }

    const initialBody = selectedRecord.bodyV2?.blocknote;

    let parsedBody = [];

    // TODO: Remove this once we have removed the old rich text
    try {
      parsedBody = JSON.parse(initialBody);
    } catch {
      // eslint-disable-next-line no-console
      console.warn(
        `Failed to parse body for record ${recordId}, for rich text version 'v2'`,
      );
      // eslint-disable-next-line no-console
      console.warn(initialBody);
    }

    const { exportBlockNoteEditorToPdf } = await import(
      '@/action-menu/actions/record-actions/single-record/utils/exportBlockNoteEditorToPdf'
    );

    await exportBlockNoteEditorToPdf(parsedBody, filename);

    // TODO later: implement DOCX export
    // const { exportBlockNoteEditorToDocx } = await import(
    //   '@/action-menu/actions/record-actions/single-record/utils/exportBlockNoteEditorToDocx'
    // );
    // await exportBlockNoteEditorToDocx(editor, filename);
  };

  return <Action onClick={handleClick} />;
};
