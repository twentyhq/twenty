import { useGetFieldMetadataItemById } from '@/object-metadata/hooks/useGetFieldMetadataItemById';
import { getCompositeSubFieldLabel } from '@/object-record/object-filter-dropdown/utils/getCompositeSubFieldLabel';
import { isCompositeFieldType } from '@/object-record/object-filter-dropdown/utils/isCompositeFieldType';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { isValidSubFieldName } from '@/settings/data-model/utils/isValidSubFieldName';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';
import { useIcons } from 'twenty-ui/display';

export const useRecordFilterField = (recordFilterId: string) => {
  const currentRecordFilters = useRecoilComponentValue(
    currentRecordFiltersComponentState,
  );

  const recordFilter = currentRecordFilters.find(
    (recordFilter) => recordFilter.id === recordFilterId,
  );

  const { getFieldMetadataItemById } = useGetFieldMetadataItemById();

  const fieldMetadataItem = isNonEmptyString(recordFilter?.fieldMetadataId)
    ? getFieldMetadataItemById(recordFilter?.fieldMetadataId)
    : undefined;

  const { getIcon } = useIcons();

  const icon = isDefined(fieldMetadataItem?.icon)
    ? getIcon(fieldMetadataItem?.icon)
    : undefined;

  const subFieldLabel =
    isDefined(fieldMetadataItem) &&
    isCompositeFieldType(fieldMetadataItem.type) &&
    isNonEmptyString(recordFilter?.subFieldName) &&
    isValidSubFieldName(recordFilter.subFieldName)
      ? getCompositeSubFieldLabel(
          fieldMetadataItem.type,
          recordFilter.subFieldName,
        )
      : '';

  const label = isNonEmptyString(subFieldLabel)
    ? `${recordFilter?.label} / ${subFieldLabel}`
    : (recordFilter?.label ?? '');

  return {
    label,
    icon,
  };
};
