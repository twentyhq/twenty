import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { INTERNAL_CREDITS_PER_DISPLAY_CREDIT } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';
import { Section } from 'twenty-ui/layout';
import { AppTooltip, TooltipDelay } from 'twenty-ui/surfaces';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { H2Title } from 'twenty-ui/typography';

import { SettingsBillingLimitUsageSelect } from '@/settings/billing/components/SettingsBillingLimitUsageSelect';
import { SettingsBillingLimitAmount } from '@/settings/billing/components/internal/SettingsBillingLimitAmount';
import { StyledSettingsBillingFieldLabel } from '@/settings/billing/components/internal/SettingsBillingFieldLabel';
import { SettingsBillingLimitSpenderSelect } from '@/settings/billing/components/SettingsBillingLimitSpenderSelect';
import { USAGE_LIMIT_METER_ICONS } from '@/settings/billing/constants/UsageLimitMeterIcons';
import { USAGE_LIMIT_METER_LABELS } from '@/settings/billing/constants/UsageLimitMeterLabels';
import { USAGE_LIMIT_PERIOD_ICONS } from '@/settings/billing/constants/UsageLimitPeriodIcons';
import { USAGE_LIMIT_PERIOD_SPAN_LABELS } from '@/settings/billing/constants/UsageLimitPeriodSpanLabels';
import { USAGE_LIMIT_PERIOD_UNIT_LABELS } from '@/settings/billing/constants/UsageLimitPeriodUnitLabels';
import { type UsageLimitFormValues } from '@/settings/billing/types/UsageLimitFormValues';
import { type UsageLimitMeter } from '@/settings/billing/types/UsageLimitMeter';
import { type UsageLimitPeriodUnit } from '@/settings/billing/types/UsageLimitPeriodUnit';
import { useUsageLimitFormatter } from '@/settings/billing/hooks/useUsageLimitFormatter';
import { type UsageQuotaScopeConsumption } from '@/settings/billing/types/UsageQuotaScopeConsumption';
import { computeUsageLimitProgress } from '@/settings/billing/utils/computeUsageLimitProgress';
import { getUsageLimitFormOptions } from '@/settings/billing/utils/getUsageLimitFormOptions';
import { getUsageLimitRingColor } from '@/settings/billing/utils/getUsageLimitRingColor';
import { Select } from '@/ui/input/components/Select';
import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';
import { ProgressRing } from '@/ui/feedback/progress-ring/components/ProgressRing';
import {
  type UsageQuotaDefinitionsQuery,
  UsageOperationType,
  type UsageResourceType,
} from '~/generated-metadata/graphql';

const RING_ANCHOR_ID = 'usage-limit-form-ring';

const StyledRow = styled.div`
  display: grid;
  gap: ${themeCssVariables.spacing[4]};
  grid-template-columns: 1fr 1fr;
`;

const StyledTooltipRow = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
  white-space: nowrap;
`;

const StyledMeterRow = styled.div`
  display: grid;
  gap: ${themeCssVariables.spacing[2]};
  grid-template-columns: 1fr 1fr;
`;

const StyledAmountCell = styled.div`
  align-items: end;
  display: flex;
  gap: ${themeCssVariables.spacing[4]};
`;

const StyledAmountField = styled.div`
  flex: 1;
  min-width: 0;

  input[type='number'] {
    appearance: textfield;
  }

  input[type='number']::-webkit-inner-spin-button,
  input[type='number']::-webkit-outer-spin-button {
    appearance: none;
    margin: 0;
  }
`;

const StyledRingCell = styled.div`
  align-items: center;
  display: flex;
  height: ${themeCssVariables.spacing[8]};
`;

type SettingsBillingLimitFormProps = {
  definitions: UsageQuotaDefinitionsQuery['usageQuotaDefinitions'];
  values: UsageLimitFormValues;
  scopeConsumption: UsageQuotaScopeConsumption | null;
  onChange: (values: UsageLimitFormValues) => void;
};

export const SettingsBillingLimitForm = ({
  definitions,
  values,
  scopeConsumption,
  onChange,
}: SettingsBillingLimitFormProps) => {
  const { t } = useLingui();
  const { formatLimitValue } = useUsageLimitFormatter();

  const options = getUsageLimitFormOptions({ definitions, values });

  const handleScopeChange = ({
    resourceType,
    operationType,
  }: {
    resourceType: UsageResourceType;
    operationType: UsageOperationType;
  }) => {
    const isNewResource = resourceType !== values.resourceType;
    const nextValues: UsageLimitFormValues = isNewResource
      ? {
          ...values,
          resourceType,
          operationType,
          spenderType: null,
          spenderId: '',
          meter: null,
          periodUnit: 'month',
        }
      : { ...values, operationType };

    const nextOptions = getUsageLimitFormOptions({
      definitions,
      values: nextValues,
    });

    onChange({
      ...nextValues,
      spenderType: isNewResource
        ? (nextOptions.spenderTypes[0] ?? null)
        : nextValues.spenderType,
      meter:
        isDefined(nextValues.meter) &&
        nextOptions.meters.includes(nextValues.meter)
          ? nextValues.meter
          : (nextOptions.meters[0] ?? null),
    });
  };

  const isCreditsMeter = values.meter === 'creditsUsedMicro';
  const consumedValue = scopeConsumption?.consumedValue ?? null;
  const limitValue = Number(values.limitValue);
  const progress = computeUsageLimitProgress({
    limitValue: isCreditsMeter
      ? limitValue * INTERNAL_CREDITS_PER_DISPLAY_CREDIT
      : limitValue,
    consumedValue,
  });
  const consumedPercentage = progress?.consumedPercentage ?? 0;
  const isExhausted = progress?.remainingValue === 0;
  const consumedText = isDefined(consumedValue)
    ? formatLimitValue({
        value: consumedValue,
        meter: values.meter ?? '',
        operationType: values.operationType ?? UsageOperationType.ALL,
      })
    : '';
  const periodSpanLabel = isDefined(values.periodUnit)
    ? t(USAGE_LIMIT_PERIOD_SPAN_LABELS[values.periodUnit])
    : '';

  const hasResource = isDefined(values.resourceType);

  const placeholderOption = hasResource
    ? undefined
    : { value: null, label: t`Choose a usage first` };

  return (
    <>
      <Section>
        <H2Title
          title={t`Scope`}
          description={t`The usage this limit applies to.`}
        />
        <StyledRow>
          <SettingsBillingLimitUsageSelect
            definitions={definitions}
            resourceType={values.resourceType}
            operationType={values.operationType}
            onChange={handleScopeChange}
          />
          <SettingsBillingLimitSpenderSelect
            allowedSpenderTypes={options.spenderTypes}
            isIntraWorkspaceLimitEntitled={
              definitions.isIntraWorkspaceLimitEntitled
            }
            spenderType={values.spenderType}
            spenderId={values.spenderId}
            isDisabled={!hasResource}
            onChange={(spender) => onChange({ ...values, ...spender })}
          />
        </StyledRow>
      </Section>
      <Section>
        <H2Title
          title={t`Limit`}
          description={t`How much can be spent, and how often it resets.`}
        />
        <StyledRow>
          <StyledAmountCell>
            <StyledAmountField>
              <StyledSettingsBillingFieldLabel>
                {isCreditsMeter ? t`Credits` : t`Amount`}
              </StyledSettingsBillingFieldLabel>
              <SettingsTextInput
                instanceId="usage-limit-value"
                placeholder={isCreditsMeter ? '100' : '1000'}
                type="number"
                min={0}
                value={values.limitValue}
                onChange={(limitValue) => onChange({ ...values, limitValue })}
                fullWidth
                disabled={!hasResource}
              />
            </StyledAmountField>
            <StyledRingCell id={RING_ANCHOR_ID}>
              <ProgressRing
                value={consumedPercentage}
                barColor={getUsageLimitRingColor({
                  consumedPercentage,
                  isExhausted,
                })}
              />
              <AppTooltip
                anchorSelect={`#${RING_ANCHOR_ID}`}
                place="top"
                delay={TooltipDelay.shortDelay}
                positionStrategy="fixed"
              >
                {isDefined(progress) ? (
                  <StyledTooltipRow>
                    {t`Used`}
                    <SettingsBillingLimitAmount
                      text={consumedText}
                      isCreditsMeter={isCreditsMeter}
                    />
                    {`· ${periodSpanLabel}`}
                  </StyledTooltipRow>
                ) : (
                  t`Nothing counted against this scope yet`
                )}
              </AppTooltip>
            </StyledRingCell>
          </StyledAmountCell>
          <StyledMeterRow>
            <Select
              dropdownId="usage-limit-meter"
              label={t`Meter`}
              fullWidth
              disabled={options.meters.length <= 1}
              value={values.meter ?? undefined}
              options={options.meters.map((meter: UsageLimitMeter) => ({
                value: meter,
                label: t(USAGE_LIMIT_METER_LABELS[meter]),
                Icon: USAGE_LIMIT_METER_ICONS[meter],
              }))}
              emptyOption={placeholderOption}
              onChange={(meter) =>
                isDefined(meter) && onChange({ ...values, meter })
              }
            />
            <Select
              dropdownId="usage-limit-period-unit"
              label={t`Period`}
              fullWidth
              disabled={!hasResource}
              value={values.periodUnit ?? undefined}
              options={options.periodUnits.map(
                (periodUnit: UsageLimitPeriodUnit) => ({
                  value: periodUnit,
                  label: t(USAGE_LIMIT_PERIOD_UNIT_LABELS[periodUnit]),
                  Icon: USAGE_LIMIT_PERIOD_ICONS[periodUnit],
                }),
              )}
              emptyOption={placeholderOption}
              onChange={(periodUnit) =>
                isDefined(periodUnit) && onChange({ ...values, periodUnit })
              }
            />
          </StyledMeterRow>
        </StyledRow>
      </Section>
    </>
  );
};
