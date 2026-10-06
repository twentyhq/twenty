import { InformationBanner } from '@/information-banner/components/InformationBanner';
import { informationBannerIsOpenComponentState } from '@/information-banner/states/informationBannerIsOpenComponentState';
import { CreditTopUpModal } from '@/settings/billing/components/CreditTopUpModal';
import { useCanBuyCreditTopUp } from '@/settings/billing/hooks/useCanBuyCreditTopUp';
import { useCreditUpgradeAction } from '@/settings/billing/hooks/useCreditUpgradeAction';
import { usePlans } from '@/settings/billing/hooks/usePlans';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { ConfirmationDialog } from '@/ui/layout/dialog/components/ConfirmationDialog';
import { useDialog } from '@/ui/layout/dialog/hooks/useDialog';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { useLingui } from '@lingui/react/macro';
import { SettingsPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { PermissionFlagType } from '~/generated-metadata/graphql';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

const COMPONENT_INSTANCE_ID = 'information-banner-no-more-credits';

const INFORMATION_BANNER_UPGRADE_CREDIT_PLAN_MODAL_ID =
  'information-banner-upgrade-credit-plan-modal';

const INFORMATION_BANNER_CREDIT_TOP_UP_MODAL_ID =
  'information-banner-credit-top-up-modal';

export const InformationBannerNoMoreCredits = () => {
  const { t } = useLingui();

  const hasPermissionToUpdateCreditPlan = useHasPermissionFlag(
    PermissionFlagType.BILLING,
  );

  const navigateSettings = useNavigateSettings();
  const { openDialog } = useDialog();

  const setInformationBannerIsOpen = useSetAtomComponentState(
    informationBannerIsOpenComponentState,
    COMPONENT_INSTANCE_ID,
  );

  const {
    nextPrice,
    nextResourceCreditsAmount,
    nextResourceCreditPrice,
    nextTierInterval,
    upgradeCreditPlan,
    isUpgrading,
  } = useCreditUpgradeAction();

  const canBuyCreditTopUp = useCanBuyCreditTopUp();
  const { isPlansLoaded } = usePlans();

  const canUpgradeInline =
    hasPermissionToUpdateCreditPlan && isDefined(nextPrice);

  // Only on the top tier: below it, moving up a tier is the cheaper way to get credits
  const canBuyCreditsInline =
    canBuyCreditTopUp && isPlansLoaded && !isDefined(nextPrice);

  const buttonOnClick = !hasPermissionToUpdateCreditPlan
    ? undefined
    : canUpgradeInline
      ? () => openDialog(INFORMATION_BANNER_UPGRADE_CREDIT_PLAN_MODAL_ID)
      : canBuyCreditsInline
        ? () => openDialog(INFORMATION_BANNER_CREDIT_TOP_UP_MODAL_ID)
        : () => navigateSettings(SettingsPath.Billing);

  return (
    <>
      <InformationBanner
        componentInstanceId={COMPONENT_INSTANCE_ID}
        color="danger"
        variant="secondary"
        message={
          !hasPermissionToUpdateCreditPlan
            ? t`Credit limit reached. Contact your admin to resume workflows, AI, and apps.`
            : canBuyCreditsInline
              ? t`Credit limit reached. Buy credits to keep workflows, AI, and apps running.`
              : t`Credit limit reached. Update your credit plan to keep workflows, AI, and apps running.`
        }
        buttonTitle={
          !hasPermissionToUpdateCreditPlan
            ? undefined
            : canBuyCreditsInline
              ? t`Buy credits`
              : t`Update plan`
        }
        buttonOnClick={buttonOnClick}
        isButtonDisabled={isUpgrading}
        onClose={() => setInformationBannerIsOpen(false)}
      />
      {canUpgradeInline && (
        <ConfirmationDialog
          dialogId={INFORMATION_BANNER_UPGRADE_CREDIT_PLAN_MODAL_ID}
          title={t`Get more credits`}
          subtitle={t`Upgrade to ${nextResourceCreditsAmount ?? ''} credits for $${nextResourceCreditPrice ?? ''}/${nextTierInterval ?? ''}.`}
          onConfirmClick={upgradeCreditPlan}
          confirmButtonText={t`Upgrade`}
          confirmButtonColor="accent"
          loading={isUpgrading}
        />
      )}
      {canBuyCreditsInline && (
        <CreditTopUpModal
          dialogId={INFORMATION_BANNER_CREDIT_TOP_UP_MODAL_ID}
        />
      )}
    </>
  );
};
