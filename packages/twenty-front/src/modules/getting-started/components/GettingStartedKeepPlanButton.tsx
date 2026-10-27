import { useGettingStartedTrial } from '@/getting-started/hooks/useGettingStartedTrial';
import { UpdatePaymentMethodModal } from '@/settings/billing/components/UpdatePaymentMethodModal';
import { useDialog } from '@/ui/layout/dialog/hooks/useDialog';
import { useLingui } from '@lingui/react/macro';
import { useId } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { IconCreditCard } from 'twenty-ui/icon';
import { Button, type ButtonProps } from 'twenty-ui/primitives/input';

type GettingStartedKeepPlanButtonProps = Pick<
  ButtonProps,
  'size' | 'color' | 'fullWidth'
>;

export const GettingStartedKeepPlanButton = ({
  size,
  color,
  fullWidth,
}: GettingStartedKeepPlanButtonProps) => {
  const { t } = useLingui();
  const modalInstanceId = `getting-started-keep-plan-${useId()}`;
  const { openDialog } = useDialog();
  const { keepPlanLabel, planLabel, formattedTrialEnd } =
    useGettingStartedTrial();

  const description = isDefined(planLabel)
    ? t`Your trial ends on ${formattedTrialEnd}. Add a card now to stay on the ${planLabel} plan after that. You won't be charged before then.`
    : t`Your trial ends on ${formattedTrialEnd}. Add a card now to keep your plan after that. You won't be charged before then.`;

  return (
    <>
      <Button
        size={size}
        color={color}
        fullWidth={fullWidth}
        startIcon={<IconCreditCard />}
        onClick={() => openDialog(modalInstanceId)}
      >
        {keepPlanLabel}
      </Button>
      <UpdatePaymentMethodModal
        modalInstanceId={modalInstanceId}
        title={keepPlanLabel}
        description={description}
      />
    </>
  );
};
