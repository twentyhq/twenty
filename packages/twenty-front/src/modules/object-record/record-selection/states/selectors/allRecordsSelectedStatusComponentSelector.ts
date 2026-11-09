import { recordIndexSelectableRecordIdsComponentSelector } from '@/object-record/record-index/states/selectors/recordIndexSelectableRecordIdsComponentSelector';
import { RecordSelectionComponentInstanceContext } from '@/object-record/record-selection/states/contexts/RecordSelectionComponentInstanceContext';
import { selectedRecordIdsComponentSelector } from '@/object-record/record-selection/states/selectors/selectedRecordIdsComponentSelector';
import { type AllRecordsSelectedStatus } from '@/object-record/record-selection/types/AllRecordsSelectedStatus';
import { createAtomComponentSelector } from '@/ui/utilities/state/jotai/utils/createAtomComponentSelector';

export const allRecordsSelectedStatusComponentSelector =
  createAtomComponentSelector<AllRecordsSelectedStatus>({
    key: 'allRecordsSelectedStatusComponentSelector',
    componentInstanceContext: RecordSelectionComponentInstanceContext,
    get:
      ({ instanceId }) =>
      ({ get }) => {
        const selectableRecordIds = get(
          recordIndexSelectableRecordIdsComponentSelector,
          { instanceId },
        );

        const numberOfSelectedRecords = get(
          selectedRecordIdsComponentSelector,
          { instanceId },
        ).length;

        return numberOfSelectedRecords === 0
          ? 'none'
          : numberOfSelectedRecords === selectableRecordIds.length
            ? 'all'
            : 'some';
      },
  });
