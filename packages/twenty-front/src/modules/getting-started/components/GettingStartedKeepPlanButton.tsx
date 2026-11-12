import { useGettingStartedTrial } from '@/getting-started/hooks/useGettingStartedTrial';
import { getGettingStartedKeepPlanDescription } from '@/getting-started/utils/getGettingStartedKeepPlanDescription';
import { UpdatePaymentMethodModal } from '@/settings/billing/components/UpdatePaymentMethodModal';
import { useDialog } from '@/ui/layout/dialog/hooks/useDialog';
import { useLingui } from '@lingui/react/macro';
import { useId } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { IconCreditCard } from 'twenty-ui/icon';
import { Button, type ButtonProps } from 'twenty-ui/primitives/input';

type GettingStartedKeepPlanButtonProps = Pick<
  ButtonProps,
  'size' | 'fullWidth'
>;

export const GettingStartedKeepPlanButton = ({
  size,
  fullWidth,
}: GettingStartedKeepPlanButtonProps) => {
  const { t } = useLingui();
  const modalInstanceId = `getting-started-keep-plan-${useId()}`;
  const { openDialog } = useDialog();
  const { planLabel, formattedTrialEnd } = useGettingStartedTrial();

  if (!isDefined(formattedTrialEnd)) {
    return null;
  }

  return (
    <>
      <Button
        size={size}
        fullWidth={fullWidth}
        startIcon={<IconCreditCard />}
        onClick={() => openDialog(modalInstanceId)}
      >
        {t`Keep Twenty`}
      </Button>
      <UpdatePaymentMethodModal
        modalInstanceId={modalInstanceId}
        title={t`Keep Twenty`}
        description={getGettingStartedKeepPlanDescription({
          planLabel,
          formattedTrialEnd,
        })}
      />
    </>
  );
};
