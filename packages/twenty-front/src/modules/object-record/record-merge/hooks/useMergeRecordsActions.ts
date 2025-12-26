import { useLingui } from '@lingui/react/macro';
import { useRecoilValue, useSetRecoilState } from 'recoil';

import { useCommandMenu } from '@/command-menu/hooks/useCommandMenu';
import { useMergeManyRecords } from '@/object-record/hooks/useMergeManyRecords';
import { useMergeRecordsSelectedRecords } from '@/object-record/record-merge/hooks/useMergeRecordsSelectedRecords';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { AppPath } from 'twenty-shared/types';
import { useNavigateApp } from '~/hooks/useNavigateApp';
import { isMergeInProgressState } from '@/object-record/record-merge/states/mergeInProgressState';
import { mergeSettingsState } from '@/object-record/record-merge/states/mergeSettingsState';

type UseMergeRecordsActionsProps = {
  objectNameSingular: string;
};

export const useMergeRecordsActions = ({
  objectNameSingular,
}: UseMergeRecordsActionsProps) => {
  const mergeSettings = useRecoilValue(mergeSettingsState);

  const { selectedRecords } = useMergeRecordsSelectedRecords();

  const { mergeManyRecords, loading: isMerging } = useMergeManyRecords({
    objectNameSingular,
  });

  const setMergeInProgress = useSetRecoilState(isMergeInProgressState);

  const { t } = useLingui();
  const { enqueueSuccessSnackBar, enqueueErrorSnackBar } = useSnackBar();
  const { closeCommandMenu } = useCommandMenu();

  const navigate = useNavigateApp();
  const handleMergeRecords = async () => {
    setMergeInProgress(true);
    try {
      const mergedRecord = await mergeManyRecords({
        recordIds: selectedRecords.map((record) => record.id),
        mergeSettings,
        preview: false,
      });

      if (!mergedRecord) {
        throw new Error('Failed to merge records');
      }

      const recordCount = selectedRecords.length;

      enqueueSuccessSnackBar({
        message: t`Successfully merged ${recordCount} records`,
      });
      closeCommandMenu();

      navigate(AppPath.RecordShowPage, {
        objectNameSingular,
        objectRecordId: mergedRecord.id,
      });
    } catch (error) {
      enqueueErrorSnackBar({
        message:
          error instanceof Error
            ? error.message
            : t`Failed to merge records. Please try again.`,
      });
    } finally {
      setMergeInProgress(false);
    }
  };

  return {
    handleMergeRecords,
    isMerging,
    selectedRecords,
  };
};
