import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { t } from '@lingui/core/macro';
import { getSettingsPath } from 'twenty-shared/utils';
import { SettingsPath } from 'twenty-shared/types';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { Section } from 'twenty-ui/layout';
import { SettingsApplicationsTable } from '~/pages/settings/applications/components/SettingsApplicationsTable';
import { useFindManyApplicationsQuery } from '~/generated-metadata/graphql';
import { TabList } from '@/ui/layout/tab-list/components/TabList';

const APPLICATIONS_ID = 'applications';

export const SettingsApplications = () => {
  const { data } = useFindManyApplicationsQuery();

  const tabs = [{ id: 'inUsed', title: 'In used' }];

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
          <TabList
            tabs={tabs}
            behaveAsLinks={false}
            componentInstanceId={APPLICATIONS_ID}
          />
          <SettingsApplicationsTable
            applications={data?.findManyApplications ?? []}
          />
        </Section>
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
