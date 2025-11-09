import { useMemo } from 'react';
import { useSetRecoilState } from 'recoil';

import { useSelectedRecordIdOrThrow } from '@/action-menu/actions/record-actions/single-record/hooks/useSelectedRecordIdOrThrow';
import { useContextStoreObjectMetadataItemOrThrow } from '@/context-store/hooks/useContextStoreObjectMetadataItemOrThrow';
import { enrichmentFieldSelectionState } from '@/enrichment/states/enrichmentFieldSelectionState';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import type { Company } from '@/companies/types/Company';

import { Action } from '@/action-menu/actions/components/Action';

const ALL_ENRICHABLE_FIELDS = [
  'employees',
  'annualRecurringRevenue',
  'address',
  'linkedinLink',
  'xLink',
  'domainName',
];

export const EnrichCompanySingleRecordAction = () => {
  const { objectMetadataItem } = useContextStoreObjectMetadataItemOrThrow();
  const recordId = useSelectedRecordIdOrThrow();
  const setEnrichmentState = useSetRecoilState(enrichmentFieldSelectionState);

  const { record } = useFindOneRecord<Company>({
    objectNameSingular: objectMetadataItem.nameSingular,
    objectRecordId: recordId,
  });

  const availableFields = useMemo(() => {
    if (record === undefined) {
      return [];
    }

    return ALL_ENRICHABLE_FIELDS.filter((field) => {
      const value = record[field as keyof Company];

      if (value === null || value === undefined || value === '') {
        return true;
      }

      if (
        typeof value === 'object' &&
        value !== null &&
        'amountMicros' in value
      ) {
        return value.amountMicros === null || value.amountMicros === 0;
      }

      if (
        typeof value === 'object' &&
        value !== null &&
        'primaryLinkUrl' in value
      ) {
        return !value.primaryLinkUrl;
      }

      if (
        typeof value === 'object' &&
        value !== null &&
        'addressStreet1' in value
      ) {
        return !value.addressStreet1;
      }

      return false;
    });
  }, [record]);

  const handleOpenSelector = () => {
    if (!record?.name) {
      return;
    }

    setEnrichmentState({
      isOpen: true,
      companyId: recordId,
      companyName: record.name,
      availableFields,
    });
  };

  if (record === undefined || availableFields.length === 0) {
    return null;
  }

  return <Action onClick={handleOpenSelector} />;
};
