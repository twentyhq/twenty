import { RecordTableComponentInstanceContext } from '@/object-record/record-table/states/context/RecordTableComponentInstanceContext';
import { dataLoadingStatusByRealIndexComponentState } from '@/object-record/record-table/virtualization/states/dataLoadingStatusByRealIndexComponentState';
import { createComponentFamilySelector } from '@/ui/utilities/state/jotai/utils/createComponentFamilySelector';
import { type Nullable } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

export const dataLoadingStatusByRealIndexComponentFamilySelector =
  createComponentFamilySelector<
    'loaded' | 'not-loaded' | undefined,
    Nullable<number>
  >({
    key: 'dataLoadingStatusByRealIndexComponentFamilySelector',
    componentInstanceContext: RecordTableComponentInstanceContext,
    get:
      ({ instanceId, familyKey }) =>
      ({ get }) => {
        const realIndex = familyKey;

        const dataLoadingStatusByRealIndex = get(
          dataLoadingStatusByRealIndexComponentState,
          { instanceId },
        );

        if (!isDefined(realIndex)) {
          return undefined;
        }

        const dataLoadingStatus = dataLoadingStatusByRealIndex.get(realIndex);

        return dataLoadingStatus;
      },
  });
