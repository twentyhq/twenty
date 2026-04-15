import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { useQuery } from '@apollo/client/react';
import { useParams } from 'react-router-dom';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import {
  FindApplicationRegistrationStatsDocument,
  FindOneApplicationRegistrationDocument,
} from '~/generated-metadata/graphql';
import { type ApplicationRegistrationData } from '~/pages/settings/applications/tabs/types/ApplicationRegistrationData';
import { SettingsApplicationRegistrationContent } from '~/pages/settings/applications/components/SettingsApplicationRegistrationContent';
import { useLingui } from '@lingui/react/macro';

export const SettingsApplicationRegistrationDetails = () => {
  const { t } = useLingui();

  const { applicationRegistrationId = '' } = useParams<{
    applicationRegistrationId: string;
  }>();

  const { data, loading } = useQuery(FindOneApplicationRegistrationDocument, {
    variables: { id: applicationRegistrationId },
    skip: !applicationRegistrationId,
  });

  const { data: statsData } = useQuery(
    FindApplicationRegistrationStatsDocument,
    {
      variables: { id: applicationRegistrationId },
      skip: !applicationRegistrationId,
    },
  );

  const registration = data?.findOneApplicationRegistration as
    | ApplicationRegistrationData
    | undefined;

  const stats = statsData?.findApplicationRegistrationStats;

  const hasActiveInstalls = (stats?.activeInstalls ?? 0) > 0;

  if (loading || !isDefined(registration)) {
    return null;
  }

  return (
    <SubMenuTopBarContainer
      title={registration.name}
      links={[
        {
          children: t`Workspace`,
          href: getSettingsPath(SettingsPath.Workspace),
        },
        {
          children: t`Applications`,
          href: getSettingsPath(SettingsPath.Applications),
        },
        { children: registration.name },
      ]}
    >
      <SettingsApplicationRegistrationContent
        registration={registration}
        hasActiveInstalls={hasActiveInstalls}
      />
    </SubMenuTopBarContainer>
  );
};
