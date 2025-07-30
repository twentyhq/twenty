import { useLingui } from '@lingui/react/macro';
import { useRecoilValue } from 'recoil';

import { useFindManyRecordsSelectedInContextStore } from '@/context-store/hooks/useFindManyRecordsSelectedInContextStore';
import { useMergeManyRecords } from '@/object-record/hooks/useMergeManyRecords';
import { AppPath } from '@/types/AppPath';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useNavigateApp } from '~/hooks/useNavigateApp';
import { mergeSettingsState } from '../states/mergeSettingsState';

type UseMergeRecordsActionsProps = {
  objectNameSingular: string;
};

export const useMergeRecordsActions = ({
  objectNameSingular,
}: UseMergeRecordsActionsProps) => {
  const mergeSettings = useRecoilValue(mergeSettingsState);
  const { records: selectedRecords } = useFindManyRecordsSelectedInContextStore(
    {
      limit: 10,
    },
  );

  const { mergeManyRecords, loading: isMerging } = useMergeManyRecords({
    objectNameSingular,
  });

  const navigate = useNavigateApp();
  const { t } = useLingui();
  const { enqueueSuccessSnackBar, enqueueErrorSnackBar } = useSnackBar();

  const handleMergeRecords = async () => {
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

      navigate(AppPath.RecordShowPage, {
        objectNameSingular: objectNameSingular,
        objectRecordId: mergedRecord.id,
      });
    } catch (error) {
      enqueueErrorSnackBar({
        message:
          error instanceof Error
            ? error.message
            : 'Failed to merge records. Please try again.',
      });
    }
  };

  return {
    handleMergeRecords,
    isMerging,
    selectedRecords,
  };
};
