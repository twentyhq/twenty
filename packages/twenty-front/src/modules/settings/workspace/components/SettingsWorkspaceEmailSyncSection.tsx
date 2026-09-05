import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { SettingsOptionCardContentToggle } from '@/settings/components/SettingsOptions/SettingsOptionCardContentToggle';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { useMutation } from '@apollo/client/react';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { IconMail } from 'twenty-ui/icon';
import { Section } from 'twenty-ui/layout';
import { Card } from 'twenty-ui/surfaces';
import { H2Title } from 'twenty-ui/typography';
import { UpdateWorkspaceDocument } from '~/generated-metadata/graphql';

export const SettingsWorkspaceEmailSyncSection = () => {
  const { t } = useLingui();

  const [currentWorkspace, setCurrentWorkspace] = useAtomState(
    currentWorkspaceState,
  );
  const { enqueueErrorSnackBar } = useSnackBar();
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
    }).catch((err) => {
      enqueueErrorSnackBar({
        apolloError: CombinedGraphQLErrors.is(err) ? err : undefined,
      });
    });
  };

  return (
    <Section>
      <H2Title
        title={t`Sync`}
        description={t`Control what the workspace imports from connected mailboxes and calendars`}
      />
      <Card rounded>
        <SettingsOptionCardContentToggle
          Icon={IconMail}
          title={t`Sync Internal Emails`}
          description={t`Include emails where all participants share the same domain.`}
          checked={currentWorkspace?.isInternalMessagesImportEnabled ?? false}
          onChange={handleSyncInternalEmailsChange}
          advancedMode
        />
      </Card>
    </Section>
  );
};
