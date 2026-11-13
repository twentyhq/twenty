import { RECORD_INDEX_TAB_QUERY_PARAM_KEY } from '@/object-record/record-index-tab/constants/RecordIndexTabQueryParamKey';
import { selectedRecordIndexTabIdComponentState } from '@/object-record/record-index-tab/states/selectedRecordIndexTabIdComponentState';
import { getRecordIndexTabListInstanceId } from '@/object-record/record-index-tab/utils/getRecordIndexTabListInstanceId';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { recordIndexTabFieldMetadataItemComponentState } from '@/object-record/record-index/states/recordIndexTabFieldMetadataItemComponentState';
import { useResetRecordSelection } from '@/object-record/record-selection/hooks/useResetRecordSelection';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { useStore } from 'jotai';
import { useSearchParams } from 'react-router-dom';

export const useSelectRecordIndexTab = () => {
  const store = useStore();

  const { recordIndexId } = useRecordIndexContextOrThrow();

  const { resetRecordSelection } = useResetRecordSelection(recordIndexId);

  const setSelectedRecordIndexTabId = useSetAtomComponentState(
    selectedRecordIndexTabIdComponentState,
  );

  const recordIndexTabFieldMetadataItemAtom =
    useAtomComponentStateCallbackState(
      recordIndexTabFieldMetadataItemComponentState,
    );

  const [, setSearchParams] = useSearchParams();

  const selectRecordIndexTab = (recordIndexTabId: string) => {
    resetRecordSelection();
    setSelectedRecordIndexTabId(recordIndexTabId);

    // The tab list keeps its own active tab, so a tab picked outside it must be set there too
    store.set(
      activeTabIdComponentState.atomFamily({
        instanceId: getRecordIndexTabListInstanceId({
          recordIndexId,
          recordIndexTabFieldMetadataId: store.get(
            recordIndexTabFieldMetadataItemAtom,
          )?.id,
        }),
      }),
      recordIndexTabId,
    );

    setSearchParams(
      (previousSearchParams) => {
        const nextSearchParams = new URLSearchParams(previousSearchParams);

        nextSearchParams.set(
          RECORD_INDEX_TAB_QUERY_PARAM_KEY,
          recordIndexTabId,
        );

        return nextSearchParams;
      },
      { replace: true },
    );
  };

  return { selectRecordIndexTab };
};
