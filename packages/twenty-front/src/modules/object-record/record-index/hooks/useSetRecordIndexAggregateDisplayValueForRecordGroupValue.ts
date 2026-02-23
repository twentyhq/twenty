import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { transformAggregateRawValueIntoAggregateDisplayValue } from '@/object-record/record-aggregate/utils/transformAggregateRawValueIntoAggregateDisplayValue';
import { recordIndexAggregateDisplayValueForGroupValueComponentFamilyState } from '@/object-record/record-index/states/recordIndexAggregateDisplayValueForGroupValueComponentFamilyState';
import { type ExtendedAggregateOperations } from '@/object-record/record-table/types/ExtendedAggregateOperations';
import { useRecoilComponentFamilyCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentFamilyCallbackState';
import { useRecoilValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilValueV2';
import { UserContext } from '@/users/contexts/UserContext';
import { useContext } from 'react';
import { useRecoilCallback } from 'recoil';
import { type Nullable } from 'twenty-shared/types';
import { dateLocaleStateV2 } from '~/localization/states/dateLocaleStateV2';

export const useSetRecordIndexAggregateDisplayValueForRecordGroupValue = () => {
  const { dateFormat, timeFormat, timeZone } = useContext(UserContext);
  const dateLocale = useRecoilValueV2(dateLocaleStateV2);

  const recordIndexAggregateValueByGroupValueCallbackState =
    useRecoilComponentFamilyCallbackState(
      recordIndexAggregateDisplayValueForGroupValueComponentFamilyState,
    );

  const setRecordIndexAggregateDisplayValueForRecordGroupValue =
    useRecoilCallback(
      ({ set }) =>
        (
          recordIndexGroupAggregateOperation: ExtendedAggregateOperations,
          recordIndexGroupAggregateFieldMetadataItem: FieldMetadataItem,
          recordIndexGroupValue: string,
          rawValue: Nullable<string | number>,
        ) => {
          const aggregateDisplayValue =
            transformAggregateRawValueIntoAggregateDisplayValue({
              aggregateFieldMetadataItem:
                recordIndexGroupAggregateFieldMetadataItem,
              aggregateOperation: recordIndexGroupAggregateOperation,
              aggregateRawValue: rawValue,
              dateFormat,
              timeFormat,
              timeZone,
              localeCatalog: dateLocale.localeCatalog,
            });

          set(
            recordIndexAggregateValueByGroupValueCallbackState({
              groupValue: recordIndexGroupValue,
            }),
            aggregateDisplayValue,
          );
        },
      [
        recordIndexAggregateValueByGroupValueCallbackState,
        dateFormat,
        dateLocale,
        timeFormat,
        timeZone,
      ],
    );

  return {
    setRecordIndexAggregateDisplayValueForRecordGroupValue,
  };
};
