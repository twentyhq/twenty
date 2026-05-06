import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsSectionSkeletonLoader } from '@/settings/components/SettingsSectionSkeletonLoader';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { useQuery } from '@apollo/client/react';
import { t } from '@lingui/core/macro';
import { useParams } from 'react-router-dom';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import { FindOneApplicationDocument } from '~/generated-metadata/graphql';
import { SettingsApplicationCommandMenuItemSettingsTab } from '~/pages/settings/applications/tabs/SettingsApplicationCommandMenuItemSettingsTab';

export const SettingsApplicationCommandMenuItemDetail = () => {
  const { applicationId = '', commandMenuItemId = '' } = useParams<{
    applicationId: string;
    commandMenuItemId: string;
  }>();

  const { data, loading } = useQuery(FindOneApplicationDocument, {
    variables: { id: applicationId },
    skip: !applicationId,
  });

  const application = data?.findOneApplication;
  const commandMenuItem = application?.commandMenuItems?.find(
    (item) => item.id === commandMenuItemId,
  );

  const frontComponent = commandMenuItem?.frontComponentId
    ? application?.frontComponents?.find(
        (fc) => fc.id === commandMenuItem.frontComponentId,
      )
    : undefined;

  const applicationContentHref = getSettingsPath(
    SettingsPath.ApplicationDetail,
    { applicationId },
    undefined,
    'content',
  );
  const breadcrumbLinks = [
    {
      children: t`Workspace`,
      href: getSettingsPath(SettingsPath.Workspace),
    },
    {
      children: t`Applications`,
      href: getSettingsPath(SettingsPath.Applications),
    },
    { children: application?.name ?? '', href: applicationContentHref },
    { children: t`Command menu items`, href: applicationContentHref },
    { children: commandMenuItem?.label ?? '' },
  ];

  return (
    <SubMenuTopBarContainer
      title={commandMenuItem?.label ?? t`Command menu item`}
      links={breadcrumbLinks}
    >
      <SettingsPageContainer>
        {loading || !isDefined(commandMenuItem) ? (
          <SettingsSectionSkeletonLoader />
        ) : (
          <SettingsApplicationCommandMenuItemSettingsTab
            label={commandMenuItem.label}
            shortLabel={commandMenuItem.shortLabel}
            icon={commandMenuItem.icon}
            isPinned={commandMenuItem.isPinned}
            availabilityType={commandMenuItem.availabilityType}
            conditionalAvailabilityExpression={
              commandMenuItem.conditionalAvailabilityExpression
            }
            frontComponentName={frontComponent?.name}
            universalIdentifier={commandMenuItem.universalIdentifier}
            createdAt={commandMenuItem.createdAt}
            updatedAt={commandMenuItem.updatedAt}
          />
        )}
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
