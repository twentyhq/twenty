import { useLingui } from '@lingui/react/macro';
import {
  AnimatedPlaceholder,
  AnimatedPlaceholderErrorContainer,
  AnimatedPlaceholderErrorSubTitle,
  AnimatedPlaceholderErrorTextContainer,
  AnimatedPlaceholderErrorTitle,
} from 'twenty-ui/feedback';
import { IconRefresh } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/input';

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
        Icon={IconRefresh}
        title={t`Try again`}
        variant="secondary"
        onClick={onRetry}
      />
    </AnimatedPlaceholderErrorContainer>
  );
};
