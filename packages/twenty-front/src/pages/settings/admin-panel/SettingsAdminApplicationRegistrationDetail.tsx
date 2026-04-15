import { useParams } from 'react-router-dom';
import { useMutation, useQuery } from '@apollo/client/react';
import {
  FindAllApplicationRegistrationsDocument,
  FindOneAdminApplicationRegistrationDocument,
  UpdateApplicationRegistrationDocument,
} from '~/generated-metadata/graphql';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import { SettingsPath } from 'twenty-shared/types';
import { useLingui } from '@lingui/react/macro';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { APPLICATION_REGISTRATION_ADMIN_PATH } from '@/settings/admin-panel/apps/constants/ApplicationRegistrationAdminPath';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsAdminApplicationRegistrationDetailContent } from '~/pages/settings/admin-panel/SettingsAdminApplicationRegistrationDetailContent';
import { SettingsOptionCardContentToggle } from '@/settings/components/SettingsOptions/SettingsOptionCardContentToggle';
import { IconArrowBarToDown } from 'twenty-ui/display';
import { Card, Section } from 'twenty-ui/layout';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { styled } from '@linaria/react';

const StyledToggleContainer = styled.div`
  display: flex;
  margin-top: ${themeCssVariables.spacing[4]};
`;

export const SettingsAdminApplicationRegistrationDetail = () => {
  const { t } = useLingui();

  const { applicationRegistrationId = '' } = useParams<{
    applicationRegistrationId: string;
  }>();

  const { data, loading } = useQuery(
    FindOneAdminApplicationRegistrationDocument,
    {
      variables: { id: applicationRegistrationId },
      skip: !applicationRegistrationId,
    },
  );

  const [updateRegistration] = useMutation(
    UpdateApplicationRegistrationDocument,
    {
      refetchQueries: [
        FindOneAdminApplicationRegistrationDocument,
        FindAllApplicationRegistrationsDocument,
      ],
    },
  );

  const registration = data?.findOneAdminApplicationRegistration;

  if (loading || !isDefined(registration)) {
    return null;
  }

  return (
    <SubMenuTopBarContainer
      title={registration.name}
      links={[
        {
          children: t`Other`,
          href: getSettingsPath(SettingsPath.AdminPanel),
        },
        {
          children: t`Admin Panel - Apps`,
          href: APPLICATION_REGISTRATION_ADMIN_PATH,
        },
        { children: registration.name },
      ]}
    >
      <SettingsPageContainer>
        <SettingsAdminApplicationRegistrationDetailContent
          registration={registration}
        />
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
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
