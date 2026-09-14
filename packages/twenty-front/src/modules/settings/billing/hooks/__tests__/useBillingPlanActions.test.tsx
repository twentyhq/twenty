import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { renderHook } from '@testing-library/react';
import { type ReactNode } from 'react';

import { BILLING_MODAL_IDS } from '@/settings/billing/constants/BillingModalIds';
import { useBillingPlanActions } from '@/settings/billing/hooks/useBillingPlanActions';
import {
  BillingPlanKey,
  PermissionFlagType,
  SubscriptionInterval,
  SubscriptionStatus,
} from '~/generated-metadata/graphql';

const mockOpenModal = jest.fn();

let mockCurrentBillingSubscription: {
  cancelAt: string | null;
  interval: SubscriptionInterval;
  status: SubscriptionStatus;
} = {
  cancelAt: null,
  interval: SubscriptionInterval.Month,
  status: SubscriptionStatus.Active,
};
let mockNextInterval: SubscriptionInterval | undefined = undefined;
let mockPermissionMap: Partial<Record<PermissionFlagType, boolean>> = {
  [PermissionFlagType.BILLING]: true,
};

jest.mock('@/ui/utilities/state/jotai/hooks/useAtomStateValue', () => ({
  useAtomStateValue: () => ({
    currentBillingSubscription: mockCurrentBillingSubscription,
  }),
}));

jest.mock('@/workspace/hooks/useSubscriptionStatus', () => ({
  useSubscriptionStatus: () => mockCurrentBillingSubscription.status,
}));

jest.mock('@/ui/layout/modal/hooks/useModal', () => ({
  useModal: () => ({ openModal: mockOpenModal }),
}));

jest.mock('@/settings/billing/hooks/useNextPlan', () => ({
  useNextPlan: () => ({ nextPlan: undefined }),
}));

jest.mock('@/settings/billing/hooks/useSplitPhaseItemsInPrices', () => ({
  useSplitPhaseItemsInPrices: () => ({
    splitedPhaseItemsInPrices: {
      nextBasePrice: mockNextInterval
        ? { recurringInterval: mockNextInterval }
        : undefined,
    },
  }),
}));

jest.mock('@/settings/roles/hooks/usePermissionFlagMap', () => ({
  usePermissionFlagMap: () => mockPermissionMap,
}));

jest.mock('@/settings/billing/hooks/useSwitchBillingPlan', () => ({
  useSwitchBillingPlan: () => ({
    isSwitchingPlan: false,
    switchBillingPlan: jest.fn(),
  }),
}));

jest.mock('@/settings/billing/hooks/useSwitchBillingInterval', () => ({
  useSwitchBillingInterval: () => ({
    isSwitchingInterval: false,
    switchBillingInterval: jest.fn(),
  }),
}));

jest.mock('@/settings/billing/hooks/useBillingPortalSession', () => ({
  useBillingPortalSession: () => ({
    isBillingPortalSessionDisabled: false,
    openBillingPortal: jest.fn(),
  }),
}));

const wrapper = ({ children }: { children: ReactNode }) => (
  <I18nProvider i18n={i18n}>{children}</I18nProvider>
);

const renderPlanActions = ({
  currentPlanKey,
  selectedInterval,
}: {
  currentPlanKey: BillingPlanKey;
  selectedInterval: SubscriptionInterval.Month | SubscriptionInterval.Year;
}) =>
  renderHook(
    () => useBillingPlanActions({ currentPlanKey, selectedInterval }),
    { wrapper },
  ).result.current.planActions;

describe('useBillingPlanActions', () => {
  beforeEach(() => {
    mockOpenModal.mockReset();
    mockCurrentBillingSubscription = {
      cancelAt: null,
      interval: SubscriptionInterval.Month,
      status: SubscriptionStatus.Active,
    };
    mockNextInterval = undefined;
    mockPermissionMap = { [PermissionFlagType.BILLING]: true };
  });

  it('marks the subscribed plan as current when the selected interval is the subscribed one', () => {
    const planActions = renderPlanActions({
      currentPlanKey: BillingPlanKey.PRO,
      selectedInterval: SubscriptionInterval.Month,
    });

    expect(planActions[BillingPlanKey.PRO].title).toBe('Current');
    expect(planActions[BillingPlanKey.PRO].disabled).toBe(true);
    expect(planActions[BillingPlanKey.ENTERPRISE].title).toBe('Upgrade');
  });

  it('offers an interval switch on the subscribed plan when another interval is selected', () => {
    const planActions = renderPlanActions({
      currentPlanKey: BillingPlanKey.PRO,
      selectedInterval: SubscriptionInterval.Year,
    });

    expect(planActions[BillingPlanKey.PRO].title).toBe('Switch to annual');
    expect(planActions[BillingPlanKey.PRO].disabled).toBe(false);

    planActions[BillingPlanKey.PRO].onClick?.();

    expect(mockOpenModal).toHaveBeenCalledWith(
      BILLING_MODAL_IDS.switchBillingIntervalToYearly,
    );
  });

  it('offers a downgrade to monthly on a yearly subscription', () => {
    mockCurrentBillingSubscription.interval = SubscriptionInterval.Year;

    const planActions = renderPlanActions({
      currentPlanKey: BillingPlanKey.ENTERPRISE,
      selectedInterval: SubscriptionInterval.Month,
    });

    expect(planActions[BillingPlanKey.ENTERPRISE].title).toBe(
      'Switch to monthly',
    );

    planActions[BillingPlanKey.ENTERPRISE].onClick?.();

    expect(mockOpenModal).toHaveBeenCalledWith(
      BILLING_MODAL_IDS.switchBillingIntervalToMonthly,
    );
  });

  it('marks the interval as scheduled when the switch is already planned', () => {
    mockNextInterval = SubscriptionInterval.Year;

    const planActions = renderPlanActions({
      currentPlanKey: BillingPlanKey.PRO,
      selectedInterval: SubscriptionInterval.Year,
    });

    expect(planActions[BillingPlanKey.PRO].title).toBe('Scheduled');
    expect(planActions[BillingPlanKey.PRO].disabled).toBe(true);
  });

  it('does not offer an interval switch without the billing permission', () => {
    mockPermissionMap = { [PermissionFlagType.BILLING]: false };

    const planActions = renderPlanActions({
      currentPlanKey: BillingPlanKey.PRO,
      selectedInterval: SubscriptionInterval.Year,
    });

    expect(planActions[BillingPlanKey.PRO].title).toBe('Contact admin');
    expect(planActions[BillingPlanKey.PRO].disabled).toBe(true);
  });
});
