import { useLingui } from '@lingui/react/macro';

import { type NavigationMenuChatAttention } from '@/navigation-menu-item/common/types/NavigationMenuChatAttention';

export const useGetNavigationMenuTabAttentionLabel = () => {
  const { t } = useLingui();

  return (tabName: string, attention: NavigationMenuChatAttention | null) => {
    switch (attention) {
      case 'needs-input':
        return t`${tabName}, needs your input`;
      case 'unread':
        return t`${tabName}, unread`;
      default:
        return tabName;
    }
  };
};
