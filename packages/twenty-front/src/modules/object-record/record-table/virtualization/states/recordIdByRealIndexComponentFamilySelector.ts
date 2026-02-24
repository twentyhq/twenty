import { RecordTableComponentInstanceContext } from '@/object-record/record-table/states/context/RecordTableComponentInstanceContext';
import { recordIdByRealIndexComponentState } from '@/object-record/record-table/virtualization/states/recordIdByRealIndexComponentState';
import { createComponentFamilySelectorV2 } from '@/ui/utilities/state/jotai/utils/createComponentFamilySelectorV2';
import { type Nullable } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

export const recordIdByRealIndexComponentFamilySelector =
  createComponentFamilySelectorV2<Nullable<string>, Nullable<number>>({
    key: 'recordIdByRealIndexComponentFamilySelector',
    componentInstanceContext: RecordTableComponentInstanceContext,
    get:
      ({ instanceId, familyKey }) =>
      ({ get }) => {
        const realIndex = familyKey;

        const recordIdByRealIndex = get(recordIdByRealIndexComponentState, {
          instanceId,
        });

        if (!isDefined(realIndex)) {
          return null;
        }

        const recordId = recordIdByRealIndex.get(realIndex);

        return recordId;
      },
  });
