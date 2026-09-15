import { dispatchBrowserEvent } from '@/browser-event/utils/dispatchBrowserEvent';
import { RECORD_EXPORT_UPDATED_EVENT } from '@/record-export/constants/RecordExportUpdatedEvent';
import { dismissedRecordExportsState } from '@/record-export/states/dismissedRecordExportsState';
import { type RecordExportSummary } from '@/record-export/types/RecordExportSummary';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useMutation } from '@apollo/client/react';
import { t } from '@lingui/core/macro';
import { useCallback, useEffect } from 'react';
import {
  CreateRecordExportDownloadUrlDocument,
  RecordExportStatus,
  RetryRecordExportDocument,
} from '~/generated-metadata/graphql';

type RecordExportNotificationEffectProps = {
  recordExport: RecordExportSummary;
};

export const RecordExportNotificationEffect = ({
  recordExport,
}: RecordExportNotificationEffectProps) => {
  const { upsertSnackBar, handleSnackBarClose, enqueueErrorSnackBar } =
    useSnackBar();
  const [dismissedRecordExports, setDismissedRecordExports] = useAtomState(
    dismissedRecordExportsState,
  );
  const [createDownloadUrl] = useMutation(
    CreateRecordExportDownloadUrlDocument,
  );
  const [retryExport] = useMutation(RetryRecordExportDocument);
  const { id, filename, status, processedRecordCount, errorMessage } =
    recordExport;
  const isCompleted = status === RecordExportStatus.COMPLETED;
  const isFailed = status === RecordExportStatus.FAILED;
  const dismissalKey = `${id}:${isCompleted || isFailed ? status : 'running'}`;
  const snackBarId = `record-export-${id}`;
  const isDismissed = dismissedRecordExports.includes(dismissalKey);

  const dismiss = useCallback(() => {
    setDismissedRecordExports((previous) =>
      [
        ...previous.filter((value) => value !== dismissalKey),
        dismissalKey,
      ].slice(-100),
    );
  }, [dismissalKey, setDismissedRecordExports]);

  const handleAction = useCallback(async () => {
    try {
      if (isCompleted) {
        const { data } = await createDownloadUrl({ variables: { id } });
        if (data?.createRecordExportDownloadUrl)
          window.location.assign(data.createRecordExportDownloadUrl);
      } else if (isFailed) {
        const { data } = await retryExport({ variables: { id } });
        if (data?.retryRecordExport) {
          dispatchBrowserEvent(
            RECORD_EXPORT_UPDATED_EVENT,
            data.retryRecordExport,
          );
          dismiss();
        }
      }
    } catch {
      enqueueErrorSnackBar({
        message: isCompleted
          ? t`The export could not be downloaded. Please try again.`
          : t`The export could not be restarted. Please try again.`,
      });
    }
  }, [
    createDownloadUrl,
    dismiss,
    enqueueErrorSnackBar,
    id,
    isCompleted,
    isFailed,
    retryExport,
  ]);

  useEffect(() => {
    if (isDismissed) {
      handleSnackBarClose(snackBarId);
      return;
    }
    const message = isCompleted
      ? t`${filename} is ready to download`
      : isFailed
        ? t`${filename} export failed`
        : status === RecordExportStatus.QUEUED
          ? t`Preparing ${filename}`
          : t`Exporting ${filename}: ${processedRecordCount} records`;
    upsertSnackBar({
      id: snackBarId,
      message,
      detailedMessage: isFailed ? (errorMessage ?? undefined) : undefined,
      progress: isCompleted ? 100 : 0,
      variant: isCompleted
        ? SnackBarVariant.Success
        : isFailed
          ? SnackBarVariant.Error
          : SnackBarVariant.Info,
      buttonLabel: isCompleted ? t`Download` : isFailed ? t`Retry` : undefined,
      buttonOnClick: isCompleted || isFailed ? handleAction : undefined,
      onClose: dismiss,
    });
  }, [
    dismiss,
    errorMessage,
    filename,
    handleAction,
    handleSnackBarClose,
    isCompleted,
    isDismissed,
    isFailed,
    processedRecordCount,
    snackBarId,
    status,
    upsertSnackBar,
  ]);

  useEffect(
    () => () => handleSnackBarClose(snackBarId),
    [handleSnackBarClose, snackBarId],
  );

  return null;
};
