import { getSettingsPagePath } from '@/settings/utils/getSettingsPagePath';
import { SettingsPath } from '@/types/SettingsPath';

export const generateBreadcrumbLinks = (pathname: string) => {
  const pathSegments = pathname.split('/').filter(Boolean);

  const links = [];

  const userRoutes = ['profile', 'appearance', 'accounts'];
  const workspaceRoutes = ['workspace', 'workspace-members'];

  if (userRoutes.includes(pathSegments[1])) {
    links.push({
      children: 'User',
      href: getSettingsPagePath(SettingsPath.ProfilePage),
    });

    if (pathSegments[1] === 'accounts' && Boolean(pathSegments[2])) {
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
          segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' '),
        href: getSettingsPagePath(
          `/${pathSegments.slice(1, index + 2).join('/')}` as SettingsPath,
        ),
      });
    });
  }

  return links;
};
