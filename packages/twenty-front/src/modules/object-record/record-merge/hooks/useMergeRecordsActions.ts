import { useLingui } from '@lingui/react/macro';
import { useRecoilValue } from 'recoil';

import { useOpenRecordInCommandMenu } from '@/command-menu/hooks/useOpenRecordInCommandMenu';
import { useFindManyRecordsSelectedInContextStore } from '@/context-store/hooks/useFindManyRecordsSelectedInContextStore';
import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';
import { useObjectNamePluralFromSingular } from '@/object-metadata/hooks/useObjectNamePluralFromSingular';
import { useMergeManyRecords } from '@/object-record/hooks/useMergeManyRecords';
import { useRecordTable } from '@/object-record/record-table/hooks/useRecordTable';
import { getRecordIndexIdFromObjectNamePluralAndViewId } from '@/object-record/utils/getRecordIndexIdFromObjectNamePluralAndViewId';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
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

  const { t } = useLingui();
  const { enqueueSuccessSnackBar, enqueueErrorSnackBar } = useSnackBar();
  const { openRecordInCommandMenu } = useOpenRecordInCommandMenu();
  const { objectNamePlural } = useObjectNamePluralFromSingular({
    objectNameSingular,
  });
  const contextStoreCurrentViewId = useRecoilComponentValueV2(
    contextStoreCurrentViewIdComponentState,
  );

  if (!contextStoreCurrentViewId) {
    throw new Error('Current view ID is not defined');
  }

  const { resetTableRowSelection } = useRecordTable({
    recordTableId: getRecordIndexIdFromObjectNamePluralAndViewId(
      objectNamePlural,
      contextStoreCurrentViewId,
    ),
  });

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

      resetTableRowSelection();
      openRecordInCommandMenu({
        objectNameSingular,
        recordId: mergedRecord.id,
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
