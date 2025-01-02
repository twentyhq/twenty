import { createState } from '@ui/utilities/state/utils/createState';

import { RightDrawerTopBarDropdownButtons } from '@/ui/layout/right-drawer/types/RightDrawerTopBarDropdownButtons';

export const rightDrawerTopBarDropdownButtonState =
  createState<RightDrawerTopBarDropdownButtons | null>({
    key: 'rightDrawerTopBarDropdownButtonState',
    defaultValue: null,
  });
