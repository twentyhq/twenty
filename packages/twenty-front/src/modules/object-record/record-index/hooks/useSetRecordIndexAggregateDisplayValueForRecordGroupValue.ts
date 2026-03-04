import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { transformAggregateRawValueIntoAggregateDisplayValue } from '@/object-record/record-aggregate/utils/transformAggregateRawValueIntoAggregateDisplayValue';
import { recordIndexAggregateDisplayValueForGroupValueComponentFamilyState } from '@/object-record/record-index/states/recordIndexAggregateDisplayValueForGroupValueComponentFamilyState';
import { type ExtendedAggregateOperations } from '@/object-record/record-table/types/ExtendedAggregateOperations';
import { useAtomComponentFamilyStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateCallbackState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { UserContext } from '@/users/contexts/UserContext';
import { useStore } from 'jotai';
import { useCallback, useContext } from 'react';
import { type Nullable } from 'twenty-shared/types';
import { dateLocaleState } from '~/localization/states/dateLocaleState';

export const useSetRecordIndexAggregateDisplayValueForRecordGroupValue = () => {
  const { dateFormat, timeFormat, timeZone } = useContext(UserContext);
  const dateLocale = useAtomStateValue(dateLocaleState);

  const recordIndexAggregateValueByGroupValueCallbackState =
    useAtomComponentFamilyStateCallbackState(
      recordIndexAggregateDisplayValueForGroupValueComponentFamilyState,
    );

  const store = useStore();

  const setRecordIndexAggregateDisplayValueForRecordGroupValue = useCallback(
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

      store.set(
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
      store,
      timeFormat,
      timeZone,
    ],
  );

  return {
    setRecordIndexAggregateDisplayValueForRecordGroupValue,
  };
};
