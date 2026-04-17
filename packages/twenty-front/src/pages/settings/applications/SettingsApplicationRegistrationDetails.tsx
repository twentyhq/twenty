import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { useQuery } from '@apollo/client/react';
import { useParams } from 'react-router-dom';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import { FindOneApplicationRegistrationDocument } from '~/generated-metadata/graphql';
import { SettingsApplicationRegistrationContent } from '~/pages/settings/applications/components/SettingsApplicationRegistrationContent';
import { useLingui } from '@lingui/react/macro';
import { Tag } from 'twenty-ui/components';

export const SettingsApplicationRegistrationDetails = () => {
  const { t } = useLingui();

  const { applicationRegistrationId = '' } = useParams<{
    applicationRegistrationId: string;
  }>();

  const { data, loading } = useQuery(FindOneApplicationRegistrationDocument, {
    variables: { id: applicationRegistrationId },
    skip: !applicationRegistrationId,
  });

  const registration = data?.findOneApplicationRegistration;

  if (loading || !isDefined(registration)) {
    return null;
  }

  return (
    <SubMenuTopBarContainer
      title={registration.name}
      tag={<Tag text={t`Owner`} color={'gray'} />}
      links={[
        {
          children: t`Workspace`,
          href: getSettingsPath(SettingsPath.Workspace),
        },
        {
          children: t`Applications - Developer`,
          href: getSettingsPath(
            SettingsPath.Applications,
            undefined,
            undefined,
            'developer',
          ),
        },
        { children: registration.name },
      ]}
    >
      <SettingsApplicationRegistrationContent registration={registration} />
    </SubMenuTopBarContainer>
  );
};
