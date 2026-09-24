import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { getToastOptionsFromError } from '@/error-handler/utils/getToastOptionsFromError';
import { SettingsOptionCardContentSwitch } from '@/settings/components/SettingsOptions/SettingsOptionCardContentSwitch';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useMutation } from '@apollo/client/react';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { Section, useToast } from 'twenty-ui/components';
import { IconMail } from 'twenty-ui/icon';
import { Card } from 'twenty-ui/primitives/surfaces';
import { UpdateWorkspaceDocument } from '~/generated-metadata/graphql';

export const SettingsWorkspaceEmailSyncSection = () => {
  const { t } = useLingui();

  const [currentWorkspace, setCurrentWorkspace] = useAtomState(
    currentWorkspaceState,
  );
  const { enqueueToast } = useToast();
  const [updateWorkspace] = useMutation(UpdateWorkspaceDocument);

  const handleSyncInternalEmailsChange = (value: boolean) => {
    if (!isDefined(currentWorkspace)) {
      return;
    }

    if (value === currentWorkspace.isInternalMessagesImportEnabled) {
      return;
    }

    setCurrentWorkspace({
      ...currentWorkspace,
      isInternalMessagesImportEnabled: value,
    });

    updateWorkspace({
      variables: {
        input: {
          isInternalMessagesImportEnabled: value,
        },
      },
    }).catch((error) => {
      enqueueToast(getToastOptionsFromError({ error }));
    });
  };

  return (
    <Section.Root>
      <Section.Header
        title={t`Sync`}
        description={t`Control what the workspace imports from connected mailboxes and calendars`}
      />
      <Card rounded>
        <SettingsOptionCardContentSwitch
          Icon={IconMail}
          title={t`Sync Internal Emails`}
          description={t`Include emails where all participants share the same domain.`}
          checked={currentWorkspace?.isInternalMessagesImportEnabled ?? false}
          onChange={handleSyncInternalEmailsChange}
          advancedMode
        />
      </Card>
    </Section.Root>
  );
};
