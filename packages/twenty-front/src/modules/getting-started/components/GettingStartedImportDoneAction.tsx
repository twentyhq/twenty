import { GettingStartedOpenChatThreadButton } from '@/getting-started/components/GettingStartedOpenChatThreadButton';
import { type GettingStartedStepDoneActionProps } from '@/getting-started/types/GettingStartedStepDoneActionProps';
import { CoreObjectNamePlural } from '@/object-metadata/types/CoreObjectNamePlural';
import { useLingui } from '@lingui/react/macro';
import { AppPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { Button } from 'twenty-ui/primitives/input';
import { useNavigateApp } from '~/hooks/useNavigateApp';

type GettingStartedImportDoneActionProps = GettingStartedStepDoneActionProps;

export const GettingStartedImportDoneAction = ({
  doneChatThreadId,
}: GettingStartedImportDoneActionProps) => {
  const { t } = useLingui();
  const navigateApp = useNavigateApp();

  if (isDefined(doneChatThreadId)) {
    return (
      <GettingStartedOpenChatThreadButton chatThreadId={doneChatThreadId} />
    );
  }

  return (
    <Button
      onClick={() =>
        navigateApp(AppPath.RecordIndexPage, {
          objectNamePlural: CoreObjectNamePlural.Person,
        })
      }
    >{t`Open People`}</Button>
  );
};
