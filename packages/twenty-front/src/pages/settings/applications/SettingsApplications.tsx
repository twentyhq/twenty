import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { t } from '@lingui/core/macro';
import { getSettingsPath } from 'twenty-shared/utils';
import { SettingsPath } from 'twenty-shared/types';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { Section } from 'twenty-ui/layout';
import { SettingsApplicationsTable } from '~/pages/settings/applications/components/SettingsApplicationsTable';
import { useFindManyApplicationsQuery } from '~/generated-metadata/graphql';
import { TabList } from '@/ui/layout/tab-list/components/TabList';
import styled from '@emotion/styled';
import { LinkDisplay } from '@/ui/field/display/components/LinkDisplay';

const APPLICATIONS_ID = 'applications';

const StyledNoApplicationContainer = styled.div``;

export const SettingsApplications = () => {
  const { data } = useFindManyApplicationsQuery();

  const applications = data?.findManyApplications ?? [];

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
          {applications.length > 0 ? (
            <>
              <TabList
                tabs={tabs}
                behaveAsLinks={false}
                componentInstanceId={APPLICATIONS_ID}
              />
              <SettingsApplicationsTable applications={applications} />
            </>
          ) : (
            <StyledNoApplicationContainer>
              No installed application. Please check our{' '}
              <LinkDisplay
                value={{
                  url: 'https://www.npmjs.com/package/twenty-cli',
                  label: 'twenty-cli',
                }}
              />
            </StyledNoApplicationContainer>
          )}
        </Section>
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
