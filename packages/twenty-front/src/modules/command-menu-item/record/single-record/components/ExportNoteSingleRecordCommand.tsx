import { Command } from '@/command-menu-item/display/components/Command';
import { useSelectedRecordIdOrThrow } from '@/command-menu-item/record/single-record/hooks/useSelectedRecordIdOrThrow';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { isDefined } from 'twenty-shared/utils';

export const ExportNoteSingleRecordCommand = () => {
  const recordId = useSelectedRecordIdOrThrow();

  const recordStore = useAtomFamilyStateValue(recordStoreFamilyState, recordId);

  const filename = `${(recordStore?.title || 'Untitled Note').replace(/[<>:"/\\|?*]/g, '-')}`;

  const handleClick = async () => {
    if (!isDefined(recordStore)) {
      return;
    }

    const initialBody = recordStore.bodyV2?.blocknote;

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

    // TODO later: implement DOCX export
    // const { exportBlockNoteEditorToDocx } = await import(
    //   '@/command-menu-item/record/single-record/utils/exportBlockNoteEditorToDocx'
    // );
    // await exportBlockNoteEditorToDocx(editor, filename);
  };

  return <Command onClick={handleClick} />;
};
