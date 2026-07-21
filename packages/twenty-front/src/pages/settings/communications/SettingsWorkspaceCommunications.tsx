import { useApolloClient, useQuery } from '@apollo/client/react';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';

import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsDiscoveryHeroCard } from '@/settings/components/SettingsDiscoveryHeroCard';
import { GET_UNSUBSCRIBE_PAGE_PREVIEW_URL } from '@/settings/unsubscribe-topics/graphql/queries/getUnsubscribePagePreviewUrl';
import { SettingsWorkspaceUnsubscribeTopicSection } from '@/settings/unsubscribe-topics/components/SettingsWorkspaceUnsubscribeTopicSection';
import { SettingsWorkspaceEmailGroupSection } from '@/settings/workspace/components/SettingsWorkspaceEmailGroupSection';
import { SettingsPageLayout } from '@/settings/components/layout/SettingsPageLayout';
import { TabList } from '@/ui/layout/tab-list/components/TabList';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { FeatureFlagKey, SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import {
  IconBrandWhatsapp,
  IconMail,
  IconMailX,
  IconPhone,
} from 'twenty-ui/icon';
import { H2Title } from 'twenty-ui/typography';
import { Section } from 'twenty-ui/layout';
import coverDark from '~/pages/settings/communications/assets/cover-dark.png';
import coverLight from '~/pages/settings/communications/assets/cover-light.png';
import { SettingsCard } from '@/settings/components/SettingsCard';
import { useContext } from 'react';
import { ThemeContext } from 'twenty-ui/theme-constants';

const COMMUNICATIONS_TABS_INSTANCE_ID = 'settings-communications-tabs';

const StyledCardLink = styled.a`
  display: block;
  min-width: 0;
  text-decoration: none;
`;

export const SettingsWorkspaceCommunications = () => {
  const { theme } = useContext(ThemeContext);

  const { t } = useLingui();

  const isEmailGroupFeatureEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_EMAIL_GROUP_ENABLED,
  );

  const apolloClient = useApolloClient();

  const { data: unsubscribePreviewData } = useQuery<{
    unsubscribePagePreviewUrl: string;
  }>(GET_UNSUBSCRIBE_PAGE_PREVIEW_URL, {
    client: apolloClient,
    skip: !isEmailGroupFeatureEnabled,
  });

  const unsubscribePageUrl = unsubscribePreviewData?.unsubscribePagePreviewUrl;

  if (!isEmailGroupFeatureEnabled) {
    return null;
  }

  return (
    <SettingsPageLayout
      title={t`Communication`}
      links={[
        {
          children: t`Workspace`,
          href: getSettingsPath(SettingsPath.General),
        },
        { children: t`Communication` },
      ]}
    >
      <SettingsPageContainer>
        <TabList
          componentInstanceId={COMMUNICATIONS_TABS_INSTANCE_ID}
          tabs={[
            { id: 'emails', title: t`Emails`, Icon: IconMail },
            {
              id: 'whatsapp',
              title: t`Whatsapp`,
              Icon: IconBrandWhatsapp,
              disabled: true,
              pill: t`Soon`,
            },
            {
              id: 'calls',
              title: t`Calls`,
              Icon: IconPhone,
              disabled: true,
              pill: t`Soon`,
            },
          ]}
        />
        <Section>
          <SettingsDiscoveryHeroCard
            lightSrc={coverLight}
            darkSrc={coverDark}
            instanceIdPrefix="settings-communications-hero"
            tabs={[]}
          />
        </Section>
        <SettingsWorkspaceEmailGroupSection />
        <SettingsWorkspaceUnsubscribeTopicSection />
        <Section>
          <H2Title
            title={t`Unsubscribe`}
            description={t`The page your users will get redirected to to unsubscribe from your emails`}
          />
          <StyledCardLink
            href={unsubscribePageUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            <SettingsCard
              Icon={
                <IconMailX
                  size={theme.icon.size.lg}
                  stroke={theme.icon.stroke.md}
                />
              }
              title={t`See unsubscribe page`}
            />
          </StyledCardLink>
        </Section>
      </SettingsPageContainer>
    </SettingsPageLayout>
  );
};
