import { Card, Section } from 'twenty-ui/layout';
import { SettingsOptionCardContentToggle } from '@/settings/components/SettingsOptions/SettingsOptionCardContentToggle';
import { IconArrowBarToDown } from 'twenty-ui/display';
import {
  type ApplicationRegistration,
  UpdateApplicationRegistrationDocument,
} from '~/generated-metadata/graphql';
import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { useMutation } from '@apollo/client/react';
import { useLingui } from '@lingui/react/macro';

const StyledToggleContainer = styled.div`
  display: flex;
  margin-top: ${themeCssVariables.spacing[4]};
`;

export const SettingsAdminApplicationRegistrationGeneralToggles = ({
  registration,
}: {
  registration: ApplicationRegistration;
}) => {
  const { t } = useLingui();

  const [updateRegistration] = useMutation(
    UpdateApplicationRegistrationDocument,
  );

  return (
    <Section>
      <StyledToggleContainer>
        <Card rounded fullWidth>
          <SettingsOptionCardContentToggle
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
      </StyledToggleContainer>
    </Section>
  );
};
