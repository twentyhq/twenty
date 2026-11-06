import { useOpenAskAiThread } from '@/ai/hooks/useOpenAskAiThread';
import { useOpenGettingStartedWorkflow } from '@/getting-started/hooks/useOpenGettingStartedWorkflow';
import { type GettingStartedStepDoneCta } from '@/getting-started/types/GettingStartedStepDoneCta';
import { useLingui } from '@lingui/react/macro';
import { SettingsPath } from 'twenty-shared/types';
import { Button } from 'twenty-ui/primitives/input';
import { type GettingStartedStepActionKey } from '~/generated-metadata/graphql';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

type GettingStartedStepDoneButtonProps = {
  stepActionKey: GettingStartedStepActionKey;
  doneCta: GettingStartedStepDoneCta;
};

export const GettingStartedStepDoneButton = ({
  stepActionKey,
  doneCta,
}: GettingStartedStepDoneButtonProps) => {
  const { t } = useLingui();
  const { openAskAiThread } = useOpenAskAiThread();
  const { openGettingStartedWorkflow, isOpeningWorkflow } =
    useOpenGettingStartedWorkflow(stepActionKey);
  const navigateSettings = useNavigateSettings();

  switch (doneCta.type) {
    case 'chatThread':
      return (
        <Button size="sm" onClick={() => openAskAiThread(doneCta.chatThreadId)}>
          {t`Continue thread`}
        </Button>
      );
    case 'workflow':
      return (
        <Button
          size="sm"
          loading={isOpeningWorkflow}
          onClick={() => void openGettingStartedWorkflow()}
        >
          {t`Go to workflow`}
        </Button>
      );
    case 'invite':
      return (
        <Button
          size="sm"
          onClick={() => navigateSettings(SettingsPath.WorkspaceMembersPage)}
        >
          {t`Invite more`}
        </Button>
      );
  }
};
