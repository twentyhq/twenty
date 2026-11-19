import { getConditionalAvailabilityRecordFilterFieldByUniversalIdentifier } from '@/conditional-availability/utils/getConditionalAvailabilityRecordFilterFieldByUniversalIdentifier';
import { isRecordMatchingConditionalAvailabilityRecordFilterOrThrow } from '@/conditional-availability/utils/isRecordMatchingConditionalAvailabilityRecordFilterOrThrow';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { useFilterValueDependencies } from '@/object-record/record-filter/hooks/useFilterValueDependencies';
import { useMemo } from 'react';
import { type ConditionalAvailabilityRecordFilterMatcher } from 'twenty-shared/types';

export const useConditionalAvailabilityRecordFilterMatcher =
  (): ConditionalAvailabilityRecordFilterMatcher => {
    const { objectMetadataItems } = useObjectMetadataItems();
    const { filterValueDependencies } = useFilterValueDependencies();

    return useMemo(() => {
      const recordFilterFieldByUniversalIdentifier =
        getConditionalAvailabilityRecordFilterFieldByUniversalIdentifier({
          objectMetadataItems,
        });

      return ({ record, recordFilter }) =>
        isRecordMatchingConditionalAvailabilityRecordFilterOrThrow({
          record,
          recordFilter,
          recordFilterFieldByUniversalIdentifier,
          objectMetadataItems,
          filterValueDependencies,
        });
    }, [objectMetadataItems, filterValueDependencies]);
  };
