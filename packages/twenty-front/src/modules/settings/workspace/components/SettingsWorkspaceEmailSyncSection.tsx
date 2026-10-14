import { styled } from '@linaria/react';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { getToastOptionsFromError } from '@/error-handler/utils/getToastOptionsFromError';
import { SettingsCard } from '@/settings/components/SettingsCard';
import { SettingsOptionCardContentSwitch } from '@/settings/components/SettingsOptions/SettingsOptionCardContentSwitch';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useMutation } from '@apollo/client/react';
import { useLingui } from '@lingui/react/macro';
import { SettingsPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { useToast } from 'twenty-ui/components/feedback';
import { Section } from 'twenty-ui/components/layout';
import { IconForbid, IconMail } from 'twenty-ui/icon';
import { Card } from 'twenty-ui/primitives/surfaces';
import { themeCssVariables, useTheme } from 'twenty-ui/theme';
import { UpdateWorkspaceDocument } from '~/generated-metadata/graphql';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

const StyledCardsColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
`;

export const SettingsWorkspaceEmailSyncSection = () => {
  const theme = useTheme();
  const { t } = useLingui();
  const navigateSettings = useNavigateSettings();

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
      <StyledCardsColumn>
        <Card.Root rounded>
          <SettingsOptionCardContentSwitch
            Icon={IconMail}
            title={t`Sync Internal Emails`}
            description={t`Include emails where all participants share the same domain.`}
            checked={currentWorkspace?.isInternalMessagesImportEnabled ?? false}
            onChange={handleSyncInternalEmailsChange}
            advancedMode
          />
        </Card.Root>
        <SettingsCard
          Icon={
            <IconForbid
              size={theme.icon.size.lg}
              stroke={theme.icon.stroke.md}
            />
          }
          title={t`Blocklist`}
          description={t`People and domains never imported, for every member`}
          onClick={() => navigateSettings(SettingsPath.WorkspaceBlocklist)}
        />
      </StyledCardsColumn>
    </Section.Root>
  );
};
