import { useFieldMetadataItemById } from '@/object-metadata/hooks/useFieldMetadataItemById';
import { getCompositeSubFieldLabel } from '@/object-record/object-filter-dropdown/utils/getCompositeSubFieldLabel';
import { isCompositeFieldType } from '@/object-record/object-filter-dropdown/utils/isCompositeFieldType';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { isValidSubFieldName } from '@/settings/data-model/utils/isValidSubFieldName';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';
import { useIcons } from 'twenty-ui/icon';

export const useRecordFilterField = (recordFilterId: string) => {
  const currentRecordFilters = useAtomComponentStateValue(
    currentRecordFiltersComponentState,
  );

  const recordFilter = currentRecordFilters.find(
    (recordFilter) => recordFilter.id === recordFilterId,
  );

  const { fieldMetadataItem } = useFieldMetadataItemById(
    recordFilter?.fieldMetadataId ?? '',
  );

  const { fieldMetadataItem: relationTargetFieldMetadataItem } =
    useFieldMetadataItemById(recordFilter?.relationTargetFieldMetadataId ?? '');

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

  const fieldLabel = fieldMetadataItem?.label ?? '';

  const baseLabel = isDefined(relationTargetFieldMetadataItem)
    ? `${fieldLabel} → ${relationTargetFieldMetadataItem.label}`
    : fieldLabel;

  const label = isNonEmptyString(subFieldLabel)
    ? `${baseLabel} / ${subFieldLabel}`
    : baseLabel;

  return {
    label,
    icon,
  };
};
