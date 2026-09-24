import { Section } from 'twenty-ui/components';
import { Card } from 'twenty-ui/primitives/surfaces';
import { SettingsOptionCardContentSwitch } from '@/settings/components/SettingsOptions/SettingsOptionCardContentSwitch';
import { IconArrowBarToDown, IconPinned, IconShield } from 'twenty-ui/icon';
import { type ApplicationRegistration } from '~/generated-metadata/graphql';
import { UpdateAdminApplicationRegistrationDocument } from '~/generated-admin/graphql';
import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme';
import { useMutation } from '@apollo/client/react';
import { useLingui } from '@lingui/react/macro';
import { useApolloAdminClient } from '@/settings/admin-panel/apollo/hooks/useApolloAdminClient';

const StyledSwitchContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
`;

export const SettingsAdminApplicationRegistrationGeneralSwitches = ({
  registration,
}: {
  registration: ApplicationRegistration;
}) => {
  const { t } = useLingui();
  const apolloAdminClient = useApolloAdminClient();

  const [updateRegistration] = useMutation(
    UpdateAdminApplicationRegistrationDocument,
    { client: apolloAdminClient },
  );

  return (
    <Section.Root>
      <Section.Header title={t`Installation`} />
      <StyledSwitchContainer>
        <Card rounded fullWidth>
          <SettingsOptionCardContentSwitch
            Icon={IconArrowBarToDown}
            title={t`Allow installation`}
            description={t`Display this app in the NPM packages list`}
            checked={registration.isListed}
            onChange={(checked) =>
              updateRegistration({
                variables: {
                  input: {
                    id: registration.id,
                    update: { isListed: checked },
                  },
                },
              })
            }
          />
        </Card>
        <Card rounded fullWidth>
          <SettingsOptionCardContentSwitch
            Icon={IconShield}
            title={t`Vetted`}
            description={t`Mark this app as reviewed and approved`}
            checked={registration.isVetted}
            onChange={(checked) =>
              updateRegistration({
                variables: {
                  input: {
                    id: registration.id,
                    update: { isVetted: checked },
                  },
                },
              })
            }
          />
        </Card>
        <Card rounded fullWidth>
          <SettingsOptionCardContentSwitch
            Icon={IconPinned}
            title={t`Pre-install on new workspaces`}
            description={t`Automatically install this app on every newly created workspace`}
            checked={registration.isPreInstalled}
            onChange={(checked) =>
              updateRegistration({
                variables: {
                  input: {
                    id: registration.id,
                    update: { isPreInstalled: checked },
                  },
                },
              })
            }
          />
        </Card>
      </StyledSwitchContainer>
    </Section.Root>
  );
};
