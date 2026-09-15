import { useLingui } from '@lingui/react/macro';
import {
  AnimatedPlaceholder,
  AnimatedPlaceholderErrorContainer,
  AnimatedPlaceholderErrorSubTitle,
  AnimatedPlaceholderErrorTextContainer,
  AnimatedPlaceholderErrorTitle,
} from 'twenty-ui/primitives/feedback';
import { IconRefresh } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';

type SettingsBillingPlansErrorStateProps = {
  onRetry: () => void;
};

export const SettingsBillingPlansErrorState = ({
  onRetry,
}: SettingsBillingPlansErrorStateProps) => {
  const { t } = useLingui();

  return (
    <AnimatedPlaceholderErrorContainer>
      <AnimatedPlaceholder type="errorIndex" />
      <AnimatedPlaceholderErrorTextContainer>
        <AnimatedPlaceholderErrorTitle>
          {t`We couldn't load the plans`}
        </AnimatedPlaceholderErrorTitle>
        <AnimatedPlaceholderErrorSubTitle>
          {t`Something went wrong while contacting our billing service.`}
        </AnimatedPlaceholderErrorSubTitle>
      </AnimatedPlaceholderErrorTextContainer>
      <Button
        startIcon={<IconRefresh />}
        onClick={onRetry}
        variant="outline"
      >{t`Try again`}</Button>
    </AnimatedPlaceholderErrorContainer>
  );
};
