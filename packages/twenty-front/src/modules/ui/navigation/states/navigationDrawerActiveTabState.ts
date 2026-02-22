import { createStateV2 } from '@/ui/utilities/state/jotai/utils/createStateV2';

export type NavigationDrawerActiveTab = 'home' | 'chat';

export const navigationDrawerActiveTabState =
  createStateV2<NavigationDrawerActiveTab>({
    key: 'navigationDrawerActiveTab',
    defaultValue: 'home',
  });
