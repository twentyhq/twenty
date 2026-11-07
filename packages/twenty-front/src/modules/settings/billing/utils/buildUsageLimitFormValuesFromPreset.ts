import { isDefined } from 'twenty-shared/utils';

import { EMPTY_USAGE_LIMIT_FORM_VALUES } from '@/settings/billing/constants/EmptyUsageLimitFormValues';
import { USAGE_LIMIT_PRESETS } from '@/settings/billing/constants/UsageLimitPresets';
import { type UsageLimitFormValues } from '@/settings/billing/types/UsageLimitFormValues';
import { isKeyOfRecord } from '@/settings/billing/utils/isKeyOfRecord';
import { isUsageLimitPresetAvailable } from '@/settings/billing/utils/isUsageLimitPresetAvailable';
import { type UsageQuotaDefinitionsQuery } from '~/generated-metadata/graphql';

export const buildUsageLimitFormValuesFromPreset = ({
  definitions,
  presetId,
}: {
  definitions: UsageQuotaDefinitionsQuery['usageQuotaDefinitions'];
  presetId: string | null;
}): UsageLimitFormValues => {
  if (!isDefined(presetId) || !isKeyOfRecord(USAGE_LIMIT_PRESETS, presetId)) {
    return EMPTY_USAGE_LIMIT_FORM_VALUES;
  }

  const preset = USAGE_LIMIT_PRESETS[presetId];

  return isUsageLimitPresetAvailable({ definitions, preset })
    ? { ...EMPTY_USAGE_LIMIT_FORM_VALUES, ...preset.values }
    : EMPTY_USAGE_LIMIT_FORM_VALUES;
};
