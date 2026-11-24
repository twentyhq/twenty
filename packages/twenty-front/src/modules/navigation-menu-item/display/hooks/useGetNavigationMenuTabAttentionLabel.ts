import { useLingui } from '@lingui/react/macro';

import { type InboxChatAttention } from '@/inbox/types/InboxChatAttention';

export const useGetNavigationMenuTabAttentionLabel = () => {
  const { t } = useLingui();

  return ({
    tabName,
    attention,
  }: {
    tabName: string;
    attention: InboxChatAttention | null;
  }) => {
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
