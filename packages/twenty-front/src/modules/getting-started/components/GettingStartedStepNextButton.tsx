import { useSelectGettingStartedStep } from '@/getting-started/hooks/useSelectGettingStartedStep';
import { useLingui } from '@lingui/react/macro';
import { Button } from 'twenty-ui/primitives/input';
import { type GettingStartedStepActionKey } from '~/generated-metadata/graphql';

type GettingStartedStepNextButtonProps = {
  nextStepActionKey: GettingStartedStepActionKey;
};

export const GettingStartedStepNextButton = ({
  nextStepActionKey,
}: GettingStartedStepNextButtonProps) => {
  const { t } = useLingui();
  const { selectGettingStartedStep, isSaving } = useSelectGettingStartedStep();

  return (
    <Button
      size="sm"
      loading={isSaving}
      onClick={() => selectGettingStartedStep(nextStepActionKey)}
    >
      {t`Next`}
    </Button>
  );
};
