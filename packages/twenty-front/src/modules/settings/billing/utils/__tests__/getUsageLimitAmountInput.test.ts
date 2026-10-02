import { i18n } from '@lingui/core';
import { isDefined } from 'twenty-shared/utils';

import { getUsageLimitAmountInput } from '@/settings/billing/utils/getUsageLimitAmountInput';
import { UsageOperationType, UsageUnit } from '~/generated-metadata/graphql';

const getTranslatedAmountInput = ({
  unit,
  operationType,
}: {
  unit: UsageUnit | null;
  operationType: UsageOperationType | null;
}) => {
  const { label, placeholder, helpText } = getUsageLimitAmountInput({
    unit,
    operationType,
  });

  return {
    label: i18n._(label),
    placeholder,
    hasHelpText: isDefined(helpText),
  };
};

describe('getUsageLimitAmountInput', () => {
  it('asks for an amount until a unit is picked', () => {
    expect(
      getTranslatedAmountInput({ unit: null, operationType: null }),
    ).toEqual({ label: 'Amount', placeholder: '1000', hasHelpText: false });
  });

  it('asks for credits', () => {
    expect(
      getTranslatedAmountInput({
        unit: UsageUnit.CREDIT,
        operationType: UsageOperationType.ALL,
      }),
    ).toEqual({ label: 'Credits', placeholder: '100', hasHelpText: false });
  });

  it('asks for runtime in minutes and explains when it is counted', () => {
    expect(
      getTranslatedAmountInput({
        unit: UsageUnit.MILLISECOND,
        operationType: UsageOperationType.CODE_EXECUTION,
      }),
    ).toEqual({ label: 'Minutes', placeholder: '60', hasHelpText: true });
  });

  it('explains that free app runs count toward a run limit', () => {
    expect(
      getTranslatedAmountInput({
        unit: UsageUnit.INVOCATION,
        operationType: UsageOperationType.CODE_EXECUTION,
      }),
    ).toEqual({ label: 'Runs', placeholder: '1000', hasHelpText: true });
  });

  it('names workflow steps without a help text', () => {
    expect(
      getTranslatedAmountInput({
        unit: UsageUnit.INVOCATION,
        operationType: UsageOperationType.WORKFLOW_EXECUTION,
      }),
    ).toEqual({ label: 'Steps', placeholder: '1000', hasHelpText: false });
  });
});
