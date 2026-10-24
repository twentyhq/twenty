import { EMPTY_USAGE_LIMIT_FORM_VALUES } from '@/settings/billing/constants/EmptyUsageLimitFormValues';
import { type UsageLimitPreset } from '@/settings/billing/types/UsageLimitPreset';
import { getUsageLimitFormOptions } from '@/settings/billing/utils/getUsageLimitFormOptions';
import { type UsageQuotaDefinitionsQuery } from '~/generated-metadata/graphql';

export const isUsageLimitPresetAvailable = ({
  definitions,
  preset,
}: {
  definitions: UsageQuotaDefinitionsQuery['usageQuotaDefinitions'];
  preset: UsageLimitPreset;
}): boolean => {
  const options = getUsageLimitFormOptions({
    definitions,
    values: { ...EMPTY_USAGE_LIMIT_FORM_VALUES, ...preset.values },
  });

  return (
    options.operationTypes.includes(preset.values.operationType) &&
    options.spenderTypes.includes(preset.values.spenderType) &&
    options.units.includes(preset.values.unit) &&
    options.periodUnits.includes(preset.values.periodUnit)
  );
};
