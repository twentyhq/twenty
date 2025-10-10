import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { t } from '@lingui/core/macro';
import { getSettingsPath } from 'twenty-shared/utils';
import { SettingsPath } from 'twenty-shared/types';
import { H2Title } from 'twenty-ui/display';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { Section } from 'twenty-ui/layout';
import { SettingsApplicationsTable } from '~/pages/settings/applications/components/SettingsApplicationsTable';
import { useFindManyApplicationsQuery } from '~/generated-metadata/graphql';

export const SettingsApplications = () => {
  const { data } = useFindManyApplicationsQuery();

  return (
    <SubMenuTopBarContainer
      title={t`Applications`}
      links={[
        {
          children: t`Workspace`,
          href: getSettingsPath(SettingsPath.Workspace),
        },
        { children: t`Applications` },
      ]}
    >
      <SettingsPageContainer>
        <Section>
          <H2Title
            title={t`Applications`}
            description={t`Installed applications`}
          />
          <SettingsApplicationsTable
            applications={data?.findManyApplications || []}
          />
        </Section>
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
