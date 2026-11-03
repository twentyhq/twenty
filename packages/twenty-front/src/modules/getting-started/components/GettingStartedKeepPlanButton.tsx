import { useGettingStartedTrial } from '@/getting-started/hooks/useGettingStartedTrial';
import { getGettingStartedKeepPlanDescription } from '@/getting-started/utils/getGettingStartedKeepPlanDescription';
import { UpdatePaymentMethodModal } from '@/settings/billing/components/UpdatePaymentMethodModal';
import { useDialog } from '@/ui/layout/dialog/hooks/useDialog';
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
  const modalInstanceId = `getting-started-keep-plan-${useId()}`;
  const { openDialog } = useDialog();
  const { keepPlanLabel, planLabel, formattedTrialEnd } =
    useGettingStartedTrial();

  if (!isDefined(formattedTrialEnd)) {
    return null;
  }

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
        description={getGettingStartedKeepPlanDescription({
          planLabel,
          formattedTrialEnd,
        })}
      />
    </>
  );
};
