import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { LinkDisplay } from '@/ui/field/display/components/LinkDisplay';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import styled from '@emotion/styled';
import { Trans, t } from '@lingui/core/macro';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { Section } from 'twenty-ui/layout';
import { useFindManyApplicationsQuery } from '~/generated-metadata/graphql';
import { SettingsApplicationsTable } from '~/pages/settings/applications/components/SettingsApplicationsTable';

const StyledNoApplicationContainer = styled.div``;

export const SettingsApplications = () => {
  const { data } = useFindManyApplicationsQuery();

  const applications = data?.findManyApplications ?? [];

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
            <SettingsApplicationsTable applications={applications} />
          ) : (
            <StyledNoApplicationContainer>
              <Trans>
                No installed application. Please check our{' '}
                <LinkDisplay
                  value={{
                    url: 'https://www.npmjs.com/package/twenty-cli',
                    label: 'twenty-cli',
                  }}
                />
              </Trans>
            </StyledNoApplicationContainer>
          )}
        </Section>
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
