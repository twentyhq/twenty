import { useLingui } from '@lingui/react/macro';
import { useLocation } from 'react-router-dom';
import { IconButton } from 'twenty-ui/components/input';
import { useIsMobile } from 'twenty-ui/utilities';

import { INBOX_LAYOUT } from '@/inbox/constants/InboxLayout';
import { INBOX_LAYOUT_OPTIONS } from '@/inbox/constants/InboxLayoutOptions';
import { inboxLayoutState } from '@/inbox/states/inboxLayoutState';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { inboxRecordRouteObjectNamesSelector } from '@/ai-chat/states/selectors/inboxRecordRouteObjectNamesSelector';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { isInboxPath } from '~/utils/isInboxPath';

export const InboxNewThreadListToggle = () => {
  const { t } = useLingui();
  const { pathname } = useLocation();
  const inboxRecordRouteObjectNames = useAtomStateValue(
    inboxRecordRouteObjectNamesSelector,
  );
  const isMobile = useIsMobile();
  const [inboxLayout, setInboxLayout] = useAtomState(inboxLayoutState);
  const isSplitView = inboxLayout === INBOX_LAYOUT.SPLIT_VIEW;
  const LayoutIcon = INBOX_LAYOUT_OPTIONS[inboxLayout].Icon;

  if (isMobile || !isInboxPath(pathname, inboxRecordRouteObjectNames)) {
    return null;
  }

  return (
    <IconButton
      size="sm"
      variant="ghost"
      aria-label={isSplitView ? t`Hide inbox` : t`Show inbox`}
      onClick={() =>
        setInboxLayout(
          isSplitView ? INBOX_LAYOUT.RECORD_PAGE : INBOX_LAYOUT.SPLIT_VIEW,
        )
      }
    >
      <LayoutIcon />
    </IconButton>
  );
};
