import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

import { SETTINGS_COMPOSITE_FIELD_TYPE_CONFIGS } from '@/settings/data-model/constants/SettingsCompositeFieldTypeConfigs';
import { type CompositeFieldType } from '@/settings/data-model/types/CompositeFieldType';

export const getCompositeSubFieldLabel = (
  compositeFieldType: CompositeFieldType,
  subFieldName: (typeof SETTINGS_COMPOSITE_FIELD_TYPE_CONFIGS)[CompositeFieldType]['subFields'][number]['subFieldName'],
): string => {
  const compositeFieldTypeConfig =
    SETTINGS_COMPOSITE_FIELD_TYPE_CONFIGS[compositeFieldType];

  const subFieldLabel = compositeFieldTypeConfig.subFields.find(
    (subField) => subField.subFieldName === subFieldName,
  )?.subFieldLabel;

  return isDefined(subFieldLabel) ? t(subFieldLabel) : '';
};
