import {
  IconDatabase,
  type IconComponent,
  IconUserCircle,
} from 'twenty-ui/icon';

export const OAUTH_SCOPE_ICONS: Record<string, IconComponent | undefined> = {
  api: IconDatabase,
  profile: IconUserCircle,
};
