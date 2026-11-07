import { useLingui } from '@lingui/react/macro';
import { Button } from 'twenty-ui/primitives/input';

type OnboardingSkipButtonProps = {
  onClick: () => void;
  disabled?: boolean;
};

export const OnboardingSkipButton = ({
  onClick,
  disabled,
}: OnboardingSkipButtonProps) => {
  const { t } = useLingui();

  return (
    <Button variant="outline" onClick={onClick} disabled={disabled}>
      {t`Skip`}
    </Button>
  );
};
