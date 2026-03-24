import { HeadlessEngineCommandWrapperEffect } from '@/command-menu-item/engine-command/components/HeadlessEngineCommandWrapperEffect';
import { useHeadlessCommandContextApi } from '@/command-menu-item/engine-command/hooks/useHeadlessCommandContextApi';
import { isDefined } from 'twenty-shared/utils';

export const ExportNoteSingleRecordCommand = () => {
  const { selectedRecords } = useHeadlessCommandContextApi();
  const selectedRecord = selectedRecords[0];

  const recordId = selectedRecord?.id;

  if (!isDefined(recordId) || !isDefined(selectedRecord)) {
    throw new Error(
      'Record ID and selected record are required to export note to PDF',
    );
  }

  const filename = `${(selectedRecord.title || 'Untitled Note').replace(/[<>:"/\\|?*]/g, '-')}`;

  const handleExecute = async () => {
    const initialBody = selectedRecord.bodyV2?.blocknote;

    let parsedBody = [];

    // TODO: Remove this once we have removed the old rich text
    try {
      parsedBody = JSON.parse(initialBody);
    } catch {
      // oxlint-disable-next-line no-console
      console.warn(
        `Failed to parse body for record ${recordId}, for rich text version 'v2'`,
      );
      // oxlint-disable-next-line no-console
      console.warn(initialBody);
    }

    const { exportBlockNoteEditorToPdf } = await import(
      '@/command-menu-item/record/single-record/utils/exportBlockNoteEditorToPdf'
    );

    await exportBlockNoteEditorToPdf(parsedBody, filename);
  };

  return <HeadlessEngineCommandWrapperEffect execute={handleExecute} />;
};
