import { SETTINGS_COMPOSITE_FIELD_TYPE_CONFIGS } from '@/settings/data-model/constants/SettingsCompositeFieldTypeConfigs';

export const isExpectedSubFieldName = <
  GivenFieldType extends keyof typeof SETTINGS_COMPOSITE_FIELD_TYPE_CONFIGS,
  CompositeFieldTypeSettings extends
    typeof SETTINGS_COMPOSITE_FIELD_TYPE_CONFIGS,
  PossibleSubFieldsForGivenFieldType extends
    CompositeFieldTypeSettings[GivenFieldType]['subFields'][number],
>(
  fieldMetadataType: GivenFieldType,
  subFieldName: PossibleSubFieldsForGivenFieldType,
  subFieldNameToCheck: string | null | undefined,
): subFieldNameToCheck is PossibleSubFieldsForGivenFieldType => {
  return (
    (
      SETTINGS_COMPOSITE_FIELD_TYPE_CONFIGS[fieldMetadataType]
        .subFields as string[]
    ).includes(subFieldName) && subFieldName === subFieldNameToCheck
  );
};
