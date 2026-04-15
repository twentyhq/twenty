import { useParams } from 'react-router-dom';
import { useQuery } from '@apollo/client/react';
import { FindOneAdminApplicationRegistrationDocument } from '~/generated-metadata/graphql';
import type { ApplicationRegistrationData } from '~/pages/settings/applications/tabs/types/ApplicationRegistrationData';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import { SettingsApplicationRegistrationContent } from '~/pages/settings/applications/components/SettingsApplicationRegistrationContent';
import { SettingsPath } from 'twenty-shared/types';
import { useLingui } from '@lingui/react/macro';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { APPLICATION_REGISTRATION_ADMIN_PATH } from '@/settings/admin-panel/apps/constants/ApplicationRegistrationAdminPath';

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

  const registration = data?.findOneAdminApplicationRegistration as
    | ApplicationRegistrationData
    | undefined;

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
          children: t`Admin Panel`,
          href: getSettingsPath(SettingsPath.AdminPanel),
        },
        {
          children: t`App registrations`,
          href: APPLICATION_REGISTRATION_ADMIN_PATH,
        },
        { children: registration.name },
      ]}
    >
      <SettingsApplicationRegistrationContent
        registration={registration}
        hasActiveInstalls={false}
      />
    </SubMenuTopBarContainer>
  );
};
