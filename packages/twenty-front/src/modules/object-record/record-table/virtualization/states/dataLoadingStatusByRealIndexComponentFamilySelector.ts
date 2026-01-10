import { RecordTableComponentInstanceContext } from '@/object-record/record-table/states/context/RecordTableComponentInstanceContext';
import { dataLoadingStatusByRealIndexComponentState } from '@/object-record/record-table/virtualization/states/dataLoadingStatusByRealIndexComponentState';
import { createComponentFamilySelector } from '@/ui/utilities/state/component-state/utils/createComponentFamilySelector';
import { type DefaultValue } from 'recoil';
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
          dataLoadingStatusByRealIndexComponentState.atomFamily({
            instanceId,
          }),
        );

        if (!isDefined(realIndex)) {
          return undefined;
        }

        const dataLoadingStatus = dataLoadingStatusByRealIndex.get(realIndex);

        return dataLoadingStatus;
      },
    set:
      ({ familyKey, instanceId }) =>
      (
        { get, set },
        newValue: 'loaded' | 'not-loaded' | DefaultValue | undefined,
      ) => {
        if (!isDefined(familyKey)) {
          return;
        }

        const actualDataLoadingStatusByRealIndex = get(
          dataLoadingStatusByRealIndexComponentState.atomFamily({
            instanceId,
          }),
        );

        const newDataLoadingStatusByRealIndex = new Map(
          actualDataLoadingStatusByRealIndex,
        );

        if (newValue === 'loaded') {
          newDataLoadingStatusByRealIndex.set(familyKey, 'loaded');
        } else {
          newDataLoadingStatusByRealIndex.set(familyKey, 'not-loaded');
        }

        set(
          dataLoadingStatusByRealIndexComponentState.atomFamily({
            instanceId,
          }),
          newDataLoadingStatusByRealIndex,
        );
      },
  });
