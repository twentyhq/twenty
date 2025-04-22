import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { FilterableFieldType } from '@/object-record/record-filter/types/FilterableFieldType';
import { buildValueFromFilter } from '@/object-record/record-table/utils/buildRecordInputFromFilter';

import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { isDefined } from 'twenty-shared/utils';

export const useBuildRecordInputFromFilters = ({
  objectMetadataItem,
}: {
  objectMetadataItem: ObjectMetadataItem;
}) => {
  // we might need to build a recoil callback for better performance
  const currentRecordFilters = useRecoilComponentValueV2(
    currentRecordFiltersComponentState,
  );

  const buildRecordInputFromFilters = (): Partial<ObjectRecord> => {
    const recordInput: Partial<ObjectRecord> = {};

    currentRecordFilters.forEach((filter) => {
      const fieldMetadataItem = objectMetadataItem.fields.find(
        (field) => field.id === filter.fieldMetadataId,
      );

      if (isDefined(fieldMetadataItem)) {
        recordInput[fieldMetadataItem.name] = buildValueFromFilter({
          filter,
          type: fieldMetadataItem.type as FilterableFieldType,
          options: fieldMetadataItem.options ?? undefined,
        });
      }
    });

    return recordInput;
  };

  return { buildRecordInputFromFilters };
};
