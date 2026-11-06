import { HeadlessEngineCommandWrapperEffect } from '@/command-menu-item/engine-command/components/HeadlessEngineCommandWrapperEffect';
import { useHeadlessCommandContextApi } from '@/command-menu-item/engine-command/hooks/useHeadlessCommandContextApi';
import { t } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { doNotTranslate } from 'twenty-shared/i18n';
import {
  isDefined,
  parseTipTapJsonDocument,
  TIPTAP_NODE_TYPES,
} from 'twenty-shared/utils';

export const ExportNoteSingleRecordCommand = () => {
  const { selectedRecords } = useHeadlessCommandContextApi();
  const selectedRecord = selectedRecords[0];

  if (!isDefined(selectedRecord?.id)) {
    throw new Error(
      doNotTranslate('A selected record is required to export a note to PDF'),
    );
  }

  const title = isNonEmptyString(selectedRecord.title)
    ? selectedRecord.title
    : t`Untitled Note`;
  const filename = title.replace(/[<>:"/\\|?*]/g, '-');

  const handleExecute = async () => {
    const tiptap = selectedRecord.bodyV2?.tiptap;
    const document = (isNonEmptyString(tiptap)
      ? parseTipTapJsonDocument(tiptap)
      : undefined) ?? { type: TIPTAP_NODE_TYPES.DOCUMENT };

    const { exportTipTapDocumentToPdf } =
      await import('@/command-menu-item/record/single-record/utils/exportTipTapDocumentToPdf');

    await exportTipTapDocumentToPdf({ document, filename });
  };

  return <HeadlessEngineCommandWrapperEffect execute={handleExecute} />;
};
