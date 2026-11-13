import { useLingui } from '@lingui/react/macro';
import { Link, useLocation } from 'react-router-dom';
import { AppPath } from 'twenty-shared/types';
import { getAppPath } from 'twenty-shared/utils';
import { IconButton } from 'twenty-ui/components/input';
import { IconHome } from 'twenty-ui/icon';

import { InboxCloseButton } from '@/ai/components/InboxCloseButton';
import { useDefaultHomePagePath } from '@/navigation/hooks/useDefaultHomePagePath';
import { SidePanelToggleButton } from '@/side-panel/components/SidePanelToggleButton';
import { isInboxPath } from '~/utils/isInboxPath';

export const InboxNewThreadPageActions = () => {
  const { t } = useLingui();
  const { pathname } = useLocation();
  const { defaultHomePagePath } = useDefaultHomePagePath();

  return (
    <>
      <IconButton
        size="sm"
        variant="outline"
        aria-label={t`Home`}
        nativeButton={false}
        render={<Link to={defaultHomePagePath} />}
      >
        <IconHome />
      </IconButton>
      <InboxCloseButton
        destinationPath={
          isInboxPath(pathname)
            ? getAppPath(AppPath.AiChatInbox, { threadId: null })
            : undefined
        }
      />
      <SidePanelToggleButton />
    </>
  );
};
