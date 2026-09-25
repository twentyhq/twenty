import { useMediaQuery } from 'twenty-ui/utilities';

import { type ColorScheme } from '@/workspace-member/types/WorkspaceMember';

export const useSystemColorScheme = (): ColorScheme =>
  useMediaQuery('(prefers-color-scheme: dark)') ? 'Dark' : 'Light';
