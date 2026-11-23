import { useLingui } from '@lingui/react/macro';
import { type ReactNode } from 'react';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';

import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsSectionSkeletonLoader } from '@/settings/components/SettingsSectionSkeletonLoader';
import { SettingsPageLayout } from '@/settings/components/layout/SettingsPageLayout';

type SettingsApplicationContentPageLayoutProps = {
  applicationName: string;
  applicationPath: string;
  contentPath: string;
  contentTypeLabel?: string;
  title: string;
  icon: ReactNode;
  isLoading: boolean;
  children: ReactNode;
};

export const SettingsApplicationContentPageLayout = ({
  applicationName,
  applicationPath,
  contentPath,
  contentTypeLabel,
  title,
  icon,
  isLoading,
  children,
}: SettingsApplicationContentPageLayoutProps) => {
  const { t } = useLingui();

  const getContentBreadcrumbLinks = () => {
    if (!isDefined(contentTypeLabel)) {
      return [{ children: t`Content` }];
    }

    return [
      { children: t`Content`, href: contentPath },
      { children: contentTypeLabel },
    ];
  };

  return (
    <SettingsPageLayout
      links={[
        {
          children: t`Workspace`,
          href: getSettingsPath(SettingsPath.General),
        },
        {
          children: t`Apps`,
          href: getSettingsPath(SettingsPath.Applications),
        },
        { children: applicationName, href: applicationPath },
        ...getContentBreadcrumbLinks(),
      ]}
      title={title}
      icon={icon}
    >
      <SettingsPageContainer>
        {isLoading ? <SettingsSectionSkeletonLoader /> : children}
      </SettingsPageContainer>
    </SettingsPageLayout>
  );
};
