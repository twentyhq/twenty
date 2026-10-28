import { AppChip } from '@/applications/components/AppChip';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsPageLayout } from '@/settings/components/layout/SettingsPageLayout';
import { SettingsTabBar } from '@/settings/components/layout/SettingsTabBar';
import type { SingleTabProps } from '@/ui/layout/tab-list/types/SingleTabProps';
import { type BreadcrumbProps } from '@/ui/navigation/bread-crumb/types/BreadcrumbProps';
import { type ReactNode } from 'react';
import { isDefined } from 'twenty-shared/utils';

type SettingsApplicationDetailPageLayoutProps = {
  applicationId?: string;
  displayName: string;
  links: BreadcrumbProps['links'];
  tabs: SingleTabProps[];
  tabListComponentInstanceId: string;
  tabListAriaLabel: string;
  actionButton?: ReactNode;
  children: ReactNode;
};

export const SettingsApplicationDetailPageLayout = ({
  applicationId,
  displayName,
  links,
  tabs,
  tabListComponentInstanceId,
  tabListAriaLabel,
  actionButton,
  children,
}: SettingsApplicationDetailPageLayoutProps) => (
  <SettingsPageLayout
    title={displayName}
    icon={
      isDefined(applicationId) ? (
        <AppChip
          applicationId={applicationId}
          fallbackApplicationData={{ name: displayName }}
          size="md"
          chipOnly
        />
      ) : undefined
    }
    links={links}
    actionButton={actionButton}
    secondaryBar={
      tabs.length > 1 ? (
        <SettingsTabBar
          aria-label={tabListAriaLabel}
          tabs={tabs}
          componentInstanceId={tabListComponentInstanceId}
        />
      ) : undefined
    }
  >
    <SettingsPageContainer overflow="visible">{children}</SettingsPageContainer>
  </SettingsPageLayout>
);
