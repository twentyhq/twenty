import { i18n } from '@lingui/core';

import { getUsageLimitUnitLabel } from '@/settings/billing/utils/getUsageLimitUnitLabel';
import { UsageOperationType, UsageUnit } from '~/generated-metadata/graphql';

const getUnitName = (
  unit: UsageUnit,
  operationType: UsageOperationType | null,
): string => i18n._(getUsageLimitUnitLabel({ unit, operationType }).name);

describe('getUsageLimitUnitLabel', () => {
  it('counts the steps of a workflow', () => {
    expect(
      getUnitName(UsageUnit.INVOCATION, UsageOperationType.WORKFLOW_EXECUTION),
    ).toBe('Steps');
  });

  it('counts the runs of a logic function', () => {
    expect(
      getUnitName(UsageUnit.INVOCATION, UsageOperationType.CODE_EXECUTION),
    ).toBe('Runs');
  });

  it('names the unit itself when the operation gives no better name', () => {
    expect(getUnitName(UsageUnit.INVOCATION, UsageOperationType.ALL)).toBe(
      'Operations',
    );
    expect(getUnitName(UsageUnit.INVOCATION, null)).toBe('Operations');
  });

  it('keeps the unit name for anything but invocations', () => {
    expect(
      getUnitName(UsageUnit.MILLISECOND, UsageOperationType.CODE_EXECUTION),
    ).toBe('Runtime');
    expect(
      getUnitName(UsageUnit.CREDIT, UsageOperationType.WORKFLOW_EXECUTION),
    ).toBe('Credits');
  });
});
