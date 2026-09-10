import { useLingui } from '@lingui/react/macro';

import { useMergeManyRecords } from '@/object-record/hooks/useMergeManyRecords';
import { useMergeRecordsSelectedRecords } from '@/object-record/record-merge/hooks/useMergeRecordsSelectedRecords';
import { isMergeInProgressState } from '@/object-record/record-merge/states/mergeInProgressState';
import { mergeSettingsState } from '@/object-record/record-merge/states/mergeSettingsState';
import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { AppPath } from 'twenty-shared/types';
import { useToast } from 'twenty-ui/feedback';
import { useNavigateApp } from '~/hooks/useNavigateApp';

type UseMergeRecordsActionsProps = {
  objectNameSingular: string;
};

export const useMergeRecordsActions = ({
  objectNameSingular,
}: UseMergeRecordsActionsProps) => {
  const mergeSettings = useAtomStateValue(mergeSettingsState);

  const { selectedRecords } = useMergeRecordsSelectedRecords();

  const { mergeManyRecords, loading: isMerging } = useMergeManyRecords({
    objectNameSingular,
  });

  const setIsMergeInProgress = useSetAtomState(isMergeInProgressState);

  const { t } = useLingui();
  const { enqueueToast } = useToast();
  const { closeSidePanelMenu } = useSidePanelMenu();

  const navigate = useNavigateApp();
  const handleMergeRecords = async () => {
    setIsMergeInProgress(true);
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

      enqueueToast({
        variant: 'success',
        children: t`Successfully merged ${recordCount} records`,
      });
      closeSidePanelMenu();

      navigate(AppPath.RecordShowPage, {
        objectNameSingular,
        objectRecordId: mergedRecord.id,
      });
    } catch (error) {
      enqueueToast({
        variant: 'error',
        children:
          error instanceof Error
            ? error.message
            : t`Failed to merge records. Please try again.`,
      });
    } finally {
      setIsMergeInProgress(false);
    }
  };

  return {
    handleMergeRecords,
    isMerging,
    selectedRecords,
  };
};
