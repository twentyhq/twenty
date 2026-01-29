import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { getDocumentationUrl } from '@/support/utils/getDocumentationUrl';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { TabList } from '@/ui/layout/tab-list/components/TabList';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { useRecoilValue } from 'recoil';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import {
  CommandBlock,
  H2Title,
  IconApps,
  IconCode,
  IconCopy,
  IconDownload,
  IconFileInfo,
} from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';
import { useFindManyApplicationsQuery } from '~/generated-metadata/graphql';
import { type FeatureFlagKey } from '~/generated/graphql';
import { useCopyToClipboard } from '~/hooks/useCopyToClipboard';
import { SettingsApplicationsTable } from '~/pages/settings/applications/components/SettingsApplicationsTable';
import { SettingsApplicationsAvailableTab } from '~/pages/settings/applications/tabs/SettingsApplicationsAvailableTab';
import { SettingsApplicationsCreateTab } from '~/pages/settings/applications/tabs/SettingsApplicationsCreateTab';
import { SettingsApplicationsInstalledTab } from '~/pages/settings/applications/tabs/SettingsApplicationsInstalledTab';

const APPLICATIONS_TAB_LIST_ID = 'applications-tab-list';

const StyledButtonContainer = styled.div`
  margin: ${({ theme }) => theme.spacing(2)} 0;
`;

export const SettingsApplications = () => {
  const { t } = useLingui();

  const isMarketplaceEnabled = useIsFeatureEnabled(
    'IS_MARKETPLACE_ENABLED' as FeatureFlagKey,
  );

  const activeTabId = useRecoilComponentValue(
    activeTabIdComponentState,
    APPLICATIONS_TAB_LIST_ID,
  );

  const currentWorkspaceMember = useRecoilValue(currentWorkspaceMemberState);
  const { data } = useFindManyApplicationsQuery();
  const { copyToClipboard } = useCopyToClipboard();

  const applications = data?.findManyApplications ?? [];

  const commands = [
    // eslint-disable-next-line lingui/no-unlocalized-strings
    'npx create-twenty-app@latest my-twenty-app',
    // eslint-disable-next-line lingui/no-unlocalized-strings
    'cd my-twenty-app',
  ];

  const button = (
    <Button
      onClick={() => {
        copyToClipboard(commands.join('\n'), t`Commands copied to clipboard`);
      }}
      ariaLabel={t`Copy commands`}
      Icon={IconCopy}
    />
  );

  if (!isMarketplaceEnabled) {
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
          {applications.length > 0 && (
            <SettingsApplicationsTable applications={applications} />
          )}
          <Section>
            <H2Title
              title={t`Create an application`}
              description={t`You can either create a private app or share it to others`}
            />
            <CommandBlock commands={commands} button={button} />
            <StyledButtonContainer>
              <Button
                Icon={IconFileInfo}
                title={t`Read documentation`}
                onClick={() =>
                  window.open(
                    getDocumentationUrl({
                      locale: currentWorkspaceMember?.locale,
                      path: '/developers/extend/capabilities/apps',
                    }),
                    '_blank',
                  )
                }
              />
            </StyledButtonContainer>
          </Section>
        </SettingsPageContainer>
      </SubMenuTopBarContainer>
    );
  }

  const tabs = [
    { id: 'available', title: t`Available`, Icon: IconDownload },
    { id: 'installed', title: t`Installed`, Icon: IconApps },
    { id: 'create', title: t`Create an app`, Icon: IconCode },
  ];

  const renderActiveTabContent = () => {
    switch (activeTabId) {
      case 'available':
        return <SettingsApplicationsAvailableTab />;
      case 'installed':
        return <SettingsApplicationsInstalledTab />;
      case 'create':
        return <SettingsApplicationsCreateTab />;
      default:
        return <SettingsApplicationsAvailableTab />;
    }
  };

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
        <TabList
          tabs={tabs}
          componentInstanceId={APPLICATIONS_TAB_LIST_ID}
          behaveAsLinks={false}
        />
        {renderActiveTabContent()}
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
