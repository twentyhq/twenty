import { useLingui } from '@lingui/react/macro';
import { useLocation } from 'react-router-dom';
import { IconButton } from 'twenty-ui/components/input';
import { useIsMobile } from 'twenty-ui/utilities';

import { AI_CHAT_INBOX_LAYOUT } from '@/ai/constants/AiChatInboxLayout';
import { AI_CHAT_INBOX_LAYOUT_OPTIONS } from '@/ai/constants/AiChatInboxLayoutOptions';
import { aiChatInboxLayoutState } from '@/ai/states/aiChatInboxLayoutState';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { isAiChatInboxPath } from '~/utils/isAiChatInboxPath';

export const AiChatNewThreadInboxListToggle = () => {
  const { t } = useLingui();
  const { pathname } = useLocation();
  const isMobile = useIsMobile();
  const [aiChatInboxLayout, setAiChatInboxLayout] = useAtomState(
    aiChatInboxLayoutState,
  );
  const isSplitView = aiChatInboxLayout === AI_CHAT_INBOX_LAYOUT.SPLIT_VIEW;
  const LayoutIcon = AI_CHAT_INBOX_LAYOUT_OPTIONS[aiChatInboxLayout].Icon;

  if (isMobile || !isAiChatInboxPath(pathname)) {
    return null;
  }

  return (
    <IconButton
      size="sm"
      variant="ghost"
      aria-label={isSplitView ? t`Hide inbox` : t`Show inbox`}
      onClick={() =>
        setAiChatInboxLayout(
          isSplitView
            ? AI_CHAT_INBOX_LAYOUT.RECORD_PAGE
            : AI_CHAT_INBOX_LAYOUT.SPLIT_VIEW,
        )
      }
    >
      <LayoutIcon />
    </IconButton>
  );
};
