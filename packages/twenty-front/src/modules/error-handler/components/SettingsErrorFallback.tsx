import { useEffect, useState } from 'react';
import { FallbackProps } from 'react-error-boundary';
import { useLocation } from 'react-router-dom';
import { IconRefresh } from 'twenty-ui';

import { getSettingsPagePath } from '@/settings/utils/getSettingsPagePath';
import { SettingsPath } from '@/types/SettingsPath';
import { Button } from '@/ui/input/button/components/Button';
import AnimatedPlaceholder from '@/ui/layout/animated-placeholder/components/AnimatedPlaceholder';
import {
    AnimatedPlaceholderEmptyContainer,
    AnimatedPlaceholderEmptySubTitle,
    AnimatedPlaceholderEmptyTextContainer,
    AnimatedPlaceholderEmptyTitle,
} from '@/ui/layout/animated-placeholder/components/EmptyPlaceholderStyled';
import { SubMenuTopBarContainer } from '@/ui/layout/page/SubMenuTopBarContainer';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

type SettingsErrorFallbackProps = FallbackProps;

export const SettingsErrorFallback = ({
  error,
  resetErrorBoundary,
}: SettingsErrorFallbackProps) => {
  const location = useLocation();

  const [previousLocation] = useState(location);

  useEffect(() => {
    if (!isDeeplyEqual(previousLocation, location)) {
      resetErrorBoundary();
    }
  }, [previousLocation, location, resetErrorBoundary]);

  const generateBreadcrumbLinks = () => {
    const pathSegments = location.pathname.split('/').filter(Boolean);

    const links = [];

    const userRoutes = ['profile', 'appearance', 'accounts'];
    const workspaceRoutes = ['workspace', 'workspace-members'];

    if (userRoutes.includes(pathSegments[1])) {
      links.push({
        children: 'User',
        href: getSettingsPagePath(SettingsPath.ProfilePage),
      });

      if (pathSegments[1] === 'accounts' && pathSegments[2]) {
        links.push({
          children: 'Accounts',
          href: getSettingsPagePath(SettingsPath.Accounts),
        });
        links.push({
          children: pathSegments[2] === 'email' ? 'Email' : 'Calendars',
          href: getSettingsPagePath(
            pathSegments[2] === 'email'
              ? SettingsPath.AccountsEmails
              : SettingsPath.AccountsCalendars,
          ),
        });
      } else {
        links.push({
          children:
            pathSegments[1].charAt(0).toUpperCase() + pathSegments[1].slice(1),
          href: getSettingsPagePath(
            `/${pathSegments.slice(1).join('/')}` as SettingsPath,
          ),
        });
      }
    } else if (workspaceRoutes.includes(pathSegments[1])) {
      links.push({
        children: 'Workspace',
        href: getSettingsPagePath(SettingsPath.Workspace),
      });

      if (pathSegments[1] === 'workspace') {
        links.push({
          children: 'General',
          href: getSettingsPagePath(SettingsPath.Workspace),
        });
      } else if (pathSegments[1] === 'workspace-members') {
        links.push({
          children: 'Members',
          href: getSettingsPagePath(SettingsPath.WorkspaceMembersPage),
        });
      }
    } else {
      // Handle other routes
      pathSegments.slice(1).forEach((segment, index) => {
        links.push({
          children:
            segment.charAt(0).toUpperCase() +
            segment.slice(1).replace(/-/g, ' '),
          href: getSettingsPagePath(
            `/${pathSegments.slice(1, index + 2).join('/')}` as SettingsPath,
          ),
        });
      });
    }

    return links;
  };

  return (
    <SubMenuTopBarContainer
      title="Error Occurred"
      links={generateBreadcrumbLinks()}
    >
      <AnimatedPlaceholderEmptyContainer>
        <AnimatedPlaceholder type="errorIndex" />
        <AnimatedPlaceholderEmptyTextContainer>
          <AnimatedPlaceholderEmptyTitle>
            Server’s on a coffee break
          </AnimatedPlaceholderEmptyTitle>
          <AnimatedPlaceholderEmptySubTitle>
            {error.message}
          </AnimatedPlaceholderEmptySubTitle>
        </AnimatedPlaceholderEmptyTextContainer>
        <Button
          Icon={IconRefresh}
          title="Reload"
          variant={'secondary'}
          onClick={() => resetErrorBoundary()}
        />
      </AnimatedPlaceholderEmptyContainer>
    </SubMenuTopBarContainer>
  );
};
