import { createState } from "twenty-shared";

import { RightDrawerTopBarDropdownButtons } from '@/ui/layout/right-drawer/types/RightDrawerTopBarDropdownButtons';

export const rightDrawerTopBarDropdownButtonState =
  createState<RightDrawerTopBarDropdownButtons | null>({
    key: 'rightDrawerTopBarDropdownButtonState',
    defaultValue: null,
  });
