import { RecordTableComponentInstanceContext } from '@/object-record/record-table/states/context/RecordTableComponentInstanceContext';
import { recordIdByRealIndexComponentState } from '@/object-record/record-table/virtualization/states/recordIdByRealIndexComponentState';
import { createComponentFamilySelector } from '@/ui/utilities/state/component-state/utils/createComponentFamilySelector';
import { isNonEmptyString } from '@sniptt/guards';
import { type DefaultValue } from 'recoil';
import { type Nullable } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

export const recordIdByRealIndexComponentFamilySelector =
  createComponentFamilySelector<Nullable<string>, Nullable<number>>({
    key: 'recordIdByRealIndexComponentFamilySelector',
    componentInstanceContext: RecordTableComponentInstanceContext,
    get:
      ({ instanceId, familyKey }) =>
      ({ get }) => {
        const realIndex = familyKey;

        const recordIdByRealIndex = get(
          recordIdByRealIndexComponentState.atomFamily({
            instanceId,
          }),
        );

        if (!isDefined(realIndex)) {
          return null;
        }

        const recordId = recordIdByRealIndex.get(realIndex);

        return recordId;
      },
    set:
      ({ familyKey, instanceId }) =>
      ({ get, set }, newValue: Nullable<string> | DefaultValue) => {
        if (!isDefined(familyKey)) {
          return;
        }

        const actualRecordIdByRealIndex = get(
          recordIdByRealIndexComponentState.atomFamily({
            instanceId,
          }),
        );

        const newRecordIdByRealIndex = new Map(actualRecordIdByRealIndex);

        if (isNonEmptyString(newValue)) {
          newRecordIdByRealIndex.set(familyKey, newValue);
        } else {
          newRecordIdByRealIndex.delete(familyKey);
        }

        set(
          recordIdByRealIndexComponentState.atomFamily({ instanceId }),
          newRecordIdByRealIndex,
        );
      },
  });
