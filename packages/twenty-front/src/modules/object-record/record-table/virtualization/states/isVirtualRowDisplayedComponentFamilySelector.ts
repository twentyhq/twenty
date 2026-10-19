import { RecordTableComponentInstanceContext } from '@/object-record/record-table/states/context/RecordTableComponentInstanceContext';
import { realIndexByVirtualIndexComponentFamilyState } from '@/object-record/record-table/virtualization/states/realIndexByVirtualIndexComponentFamilyState';
import { totalNumberOfRecordsToVirtualizeComponentState } from '@/object-record/record-table/virtualization/states/totalNumberOfRecordsToVirtualizeComponentState';
import { createAtomComponentFamilySelector } from '@/ui/utilities/state/jotai/utils/createAtomComponentFamilySelector';
import { isDefined } from 'twenty-shared/utils';

export const isVirtualRowDisplayedComponentFamilySelector =
  createAtomComponentFamilySelector<boolean, number>({
    key: 'isVirtualRowDisplayedComponentFamilySelector',
    componentInstanceContext: RecordTableComponentInstanceContext,
    get:
      ({ instanceId, familyKey }) =>
      ({ get }) => {
        const realIndex = get(realIndexByVirtualIndexComponentFamilyState, {
          instanceId,
          familyKey: { virtualIndex: familyKey },
        });

        const totalNumberOfRecordsToVirtualize =
          get(totalNumberOfRecordsToVirtualizeComponentState, {
            instanceId,
          }) ?? 0;

        return (
          isDefined(realIndex) && realIndex < totalNumberOfRecordsToVirtualize
        );
      },
  });
