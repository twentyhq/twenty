import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { ProgressRing } from 'twenty-ui/primitives/feedback';
import { Section } from 'twenty-ui/components/layout';
import { Tooltip } from 'twenty-ui/primitives/surfaces';
import { themeCssVariables } from 'twenty-ui/theme';

import { SettingsBillingLimitUsageSelect } from '@/settings/billing/components/SettingsBillingLimitUsageSelect';
import { SettingsBillingLimitAmount } from '@/settings/billing/components/internal/SettingsBillingLimitAmount';
import { StyledSettingsBillingFieldLabel } from '@/settings/billing/components/internal/SettingsBillingFieldLabel';
import { SettingsBillingLimitSpenderSelect } from '@/settings/billing/components/SettingsBillingLimitSpenderSelect';
import { USAGE_LIMIT_PERIOD_ICONS } from '@/settings/billing/constants/UsageLimitPeriodIcons';
import { USAGE_LIMIT_PERIOD_SPAN_LABELS } from '@/settings/billing/constants/UsageLimitPeriodSpanLabels';
import { USAGE_LIMIT_PERIOD_UNIT_LABELS } from '@/settings/billing/constants/UsageLimitPeriodUnitLabels';
import { USAGE_LIMIT_UNIT_ICONS } from '@/settings/billing/constants/UsageLimitUnitIcons';
import { type UsageLimitFormValues } from '@/settings/billing/types/UsageLimitFormValues';
import { type UsageLimitPeriodUnit } from '@/settings/billing/types/UsageLimitPeriodUnit';
import { useUsageLimitFormatter } from '@/settings/billing/hooks/useUsageLimitFormatter';
import { type UsageQuotaScopeConsumption } from '@/settings/billing/types/UsageQuotaScopeConsumption';
import { computeUsageLimitProgress } from '@/settings/billing/utils/computeUsageLimitProgress';
import { getUsageLimitFormOptions } from '@/settings/billing/utils/getUsageLimitFormOptions';
import { getUsageLimitInputScale } from '@/settings/billing/utils/getUsageLimitInputScale';
import { getUsageLimitLabel } from '@/settings/billing/utils/getUsageLimitLabel';
import { getUsageLimitAmountInput } from '@/settings/billing/utils/getUsageLimitAmountInput';
import { getUsageLimitRingColor } from '@/settings/billing/utils/getUsageLimitRingColor';
import { getUsageLimitUnitLabel } from '@/settings/billing/utils/getUsageLimitUnitLabel';
import { hasUsageLimitValue } from '@/settings/billing/utils/hasUsageLimitValue';
import { Select } from '@/ui/input/components/Select';
import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';
import { TooltipDelay } from '@/ui/layout/tooltip/constants/TooltipDelay';
import {
  type UsageQuotaDefinitionsQuery,
  UsageOperationType,
  type UsageResourceType,
  type UsageUnit,
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

const StyledUnitRow = styled.div`
  display: grid;
  gap: ${themeCssVariables.spacing[2]};
  grid-template-columns: 1fr 1fr;
`;

const StyledAmountField = styled.div`
  flex: 1;
  min-width: 0;
`;

const StyledRingAnchor = styled.div`
  align-items: center;
  display: flex;
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

  const handleValuesChange = (nextValues: UsageLimitFormValues) => {
    const { periodUnits } = getUsageLimitFormOptions({
      definitions,
      values: nextValues,
    });

    onChange({
      ...nextValues,
      periodUnit:
        isDefined(nextValues.periodUnit) &&
        periodUnits.includes(nextValues.periodUnit)
          ? nextValues.periodUnit
          : (periodUnits[0] ?? null),
    });
  };

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
          unit: null,
          periodUnit: 'month',
        }
      : { ...values, operationType };

    const nextOptions = getUsageLimitFormOptions({
      definitions,
      values: nextValues,
    });

    handleValuesChange({
      ...nextValues,
      spenderType: isNewResource
        ? (nextOptions.spenderTypes[0] ?? null)
        : nextValues.spenderType,
      unit:
        isDefined(nextValues.unit) &&
        nextOptions.units.includes(nextValues.unit)
          ? nextValues.unit
          : (nextOptions.units[0] ?? null),
    });
  };

  const consumedValue = scopeConsumption?.consumedValue ?? null;
  const progress = hasUsageLimitValue(values)
    ? computeUsageLimitProgress({
        limitValue:
          Number(values.limitValue) * getUsageLimitInputScale(values.unit),
        consumedValue,
      })
    : null;
  const consumedPercentage = progress?.consumedPercentage ?? 0;
  const isExhausted = progress?.remainingValue === 0;
  const hasConsumption = isDefined(consumedValue) && consumedValue > 0;
  const consumedText =
    isDefined(consumedValue) && isDefined(values.unit)
      ? formatLimitValue({
          value: consumedValue,
          unit: values.unit,
          operationType: values.operationType ?? UsageOperationType.ALL,
        })
      : '';
  const amountInput = getUsageLimitAmountInput({
    unit: values.unit,
    operationType: values.operationType,
  });
  const periodSpanLabelDescriptor = isDefined(values.periodUnit)
    ? getUsageLimitLabel(USAGE_LIMIT_PERIOD_SPAN_LABELS, values.periodUnit)
    : undefined;
  const periodSpanLabel = isDefined(periodSpanLabelDescriptor)
    ? t(periodSpanLabelDescriptor)
    : '';

  const hasResource = isDefined(values.resourceType);

  const placeholderOption = hasResource
    ? undefined
    : { value: null, label: t`Choose a usage first` };

  return (
    <>
      <Section.Root>
        <Section.Header
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
            onChange={(spender) =>
              handleValuesChange({ ...values, ...spender })
            }
          />
        </StyledRow>
      </Section.Root>
      <Section.Root>
        <Section.Header
          title={t`Limit`}
          description={t`How much can be spent, and how often it resets.`}
        />
        <StyledRow>
          <StyledAmountField>
            <StyledSettingsBillingFieldLabel>
              {t(amountInput.label)}
            </StyledSettingsBillingFieldLabel>
            <SettingsTextInput
              instanceId="usage-limit-value"
              placeholder={amountInput.placeholder}
              type="number"
              min={0}
              value={values.limitValue}
              onChange={(limitValue) => onChange({ ...values, limitValue })}
              fullWidth
              disabled={!hasResource}
              RightIcon={() => (
                <Tooltip
                  side="top"
                  delay={TooltipDelay.shortDelay}
                  positionMethod="fixed"
                  content={
                    <>
                      {hasConsumption && isDefined(values.unit) ? (
                        <StyledTooltipRow>
                          {t`Used`}
                          <SettingsBillingLimitAmount
                            text={consumedText}
                            unit={values.unit}
                          />
                          {`· ${periodSpanLabel}`}
                        </StyledTooltipRow>
                      ) : (
                        t`Nothing counted against this scope yet`
                      )}
                    </>
                  }
                >
                  <StyledRingAnchor id={RING_ANCHOR_ID}>
                    <ProgressRing
                      value={consumedPercentage}
                      aria-label={t`Used`}
                      barColor={getUsageLimitRingColor({
                        consumedPercentage,
                        isExhausted,
                      })}
                    />
                  </StyledRingAnchor>
                </Tooltip>
              )}
            />
          </StyledAmountField>
          <StyledUnitRow>
            <Select
              dropdownId="usage-limit-unit"
              label={t`Unit`}
              fullWidth
              disabled={options.units.length <= 1}
              value={values.unit ?? undefined}
              options={options.units.map((unit: UsageUnit) => ({
                value: unit,
                label: t(
                  getUsageLimitUnitLabel({
                    unit,
                    operationType: values.operationType,
                  }).name,
                ),
                Icon: USAGE_LIMIT_UNIT_ICONS[unit],
              }))}
              emptyOption={placeholderOption}
              onChange={(unit) =>
                isDefined(unit) && handleValuesChange({ ...values, unit })
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
          </StyledUnitRow>
        </StyledRow>
      </Section.Root>
    </>
  );
};
