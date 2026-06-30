import { MAIN_CONTEXT_STORE_INSTANCE_ID } from '@/context-store/constants/MainContextStoreInstanceId';
import { contextStoreNumberOfSelectedRecordsComponentState } from '@/context-store/states/contextStoreNumberOfSelectedRecordsComponentState';
import { createAtomSelector } from '@/ui/utilities/state/jotai/utils/createAtomSelector';

export const mainContextStoreHasSelectedRecordsSelector =
  createAtomSelector<boolean>({
    key: 'mainContextStoreHasSelectedRecordsSelector',
    get: ({ get }) => {
      const numberOfSelectedRecords = get(
        contextStoreNumberOfSelectedRecordsComponentState,
        { instanceId: MAIN_CONTEXT_STORE_INSTANCE_ID },
      );

      return numberOfSelectedRecords > 0;
    },
  });
