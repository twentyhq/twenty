import { InformationBanner } from '@/information-banner/components/InformationBanner';
import { informationBannerIsOpenComponentState } from '@/information-banner/states/informationBannerIsOpenComponentState';
import { useCreditUpgradeAction } from '@/settings/billing/hooks/useCreditUpgradeAction';
import { usePermissionFlagMap } from '@/settings/roles/hooks/usePermissionFlagMap';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { useLingui } from '@lingui/react/macro';
import { SettingsPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { PermissionFlagType } from '~/generated-metadata/graphql';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

const COMPONENT_INSTANCE_ID = 'information-banner-no-more-credits';

const INFORMATION_BANNER_UPGRADE_CREDIT_PLAN_MODAL_ID =
  'information-banner-upgrade-credit-plan-modal';

export const InformationBannerNoMoreCredits = () => {
  const { t } = useLingui();

  const { [PermissionFlagType.BILLING]: hasPermissionToUpdateCreditPlan } =
    usePermissionFlagMap();

  const navigateSettings = useNavigateSettings();
  const { openModal } = useModal();

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

  const canUpgradeInline =
    hasPermissionToUpdateCreditPlan && isDefined(nextPrice);

  const buttonOnClick = !hasPermissionToUpdateCreditPlan
    ? undefined
    : canUpgradeInline
      ? () => openModal(INFORMATION_BANNER_UPGRADE_CREDIT_PLAN_MODAL_ID)
      : () => navigateSettings(SettingsPath.Billing);

  return (
    <>
      <InformationBanner
        componentInstanceId={COMPONENT_INSTANCE_ID}
        color="danger"
        variant="secondary"
        message={
          hasPermissionToUpdateCreditPlan
            ? t`Credits limit reached. Update your credit plan to keep Workflows and AI running.`
            : t`Credits limit reached. Contact your admin to resume Workflows and AI.`
        }
        buttonTitle={
          hasPermissionToUpdateCreditPlan ? t`Update plan` : undefined
        }
        buttonOnClick={buttonOnClick}
        isButtonDisabled={isUpgrading}
        onClose={() => setInformationBannerIsOpen(false)}
      />
      {canUpgradeInline && (
        <ConfirmationModal
          modalInstanceId={INFORMATION_BANNER_UPGRADE_CREDIT_PLAN_MODAL_ID}
          title={t`Get more credits`}
          subtitle={t`Upgrade to ${nextResourceCreditsAmount ?? ''} credits for $${nextResourceCreditPrice ?? ''}/${nextTierInterval ?? ''}.`}
          onConfirmClick={upgradeCreditPlan}
          confirmButtonText={t`Upgrade`}
          confirmButtonAccent="blue"
          loading={isUpgrading}
        />
      )}
    </>
  );
};
