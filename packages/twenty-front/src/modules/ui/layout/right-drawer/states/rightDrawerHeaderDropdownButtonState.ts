import { createState } from 'twenty-ui';

import { RightDrawerTopBarDropdownButtons } from '@/ui/layout/right-drawer/types/RightDrawerTopBarDropdownButtons';

export const rightDrawerTopBarDropdownButtonState =
  createState<RightDrawerTopBarDropdownButtons | null>({
    key: 'rightDrawerTopBarDropdownButtonState',
    defaultValue: null,
  });
