import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { useHasValidationRulesEntitlement } from '@/validation-rules/hooks/useHasValidationRulesEntitlement';
import { useValidationRules } from '@/validation-rules/hooks/useValidationRules';
import { buildValidationRuleFieldDescriptors } from '@/validation-rules/utils/buildValidationRuleFieldDescriptors';
import { computeSelectValuesBlockedByValidationRules } from '@/validation-rules/utils/computeSelectValuesBlockedByValidationRules';
import { useMemo } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { type SelectOption } from 'twenty-ui/primitives/input';

export const useFilteredSelectOptionsFromValidationRules = ({
  recordId,
  fieldMetadataId,
  objectMetadataNameSingular,
  options,
  currentValue,
}: {
  recordId: string;
  fieldMetadataId: string;
  objectMetadataNameSingular: string | undefined;
  options: SelectOption[];
  currentValue: string | null;
}): { filteredOptions: SelectOption[]; canSelectEmpty: boolean } => {
  const hasValidationRulesEntitlement = useHasValidationRulesEntitlement();
  const { objectMetadataItems } = useObjectMetadataItems();
  const recordStore = useAtomFamilyStateValue(recordStoreFamilyState, recordId);

  const objectMetadataItem = objectMetadataItems.find(
    (item) => item.nameSingular === objectMetadataNameSingular,
  );

  const { validationRules } = useValidationRules({
    objectMetadataId:
      hasValidationRulesEntitlement && isDefined(objectMetadataItem)
        ? objectMetadataItem.id
        : '',
  });

  return useMemo(() => {
    const fieldMetadataItem = objectMetadataItem?.fields.find(
      (field) => field.id === fieldMetadataId,
    );

    if (
      !isDefined(objectMetadataItem) ||
      !isDefined(fieldMetadataItem) ||
      !isDefined(recordStore) ||
      validationRules.length === 0
    ) {
      return { filteredOptions: options, canSelectEmpty: true };
    }

    const { blockedOptionValues, isEmptyValueBlocked } =
      computeSelectValuesBlockedByValidationRules({
        validationRules,
        record: recordStore,
        fieldMetadataItem,
        optionValues: options.map((option) => option.value),
        fields: buildValidationRuleFieldDescriptors({
          objectMetadataItem,
          objectMetadataItems,
        }),
        fieldMetadataItems: objectMetadataItem.fields,
        now: new Date().toISOString(),
      });

    return {
      filteredOptions: options.filter(
        (option) =>
          option.value === currentValue ||
          !blockedOptionValues.includes(option.value),
      ),
      canSelectEmpty: !isEmptyValueBlocked,
    };
  }, [
    currentValue,
    fieldMetadataId,
    objectMetadataItem,
    objectMetadataItems,
    options,
    recordStore,
    validationRules,
  ]);
};
