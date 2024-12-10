import { Button, IconButton, IconDotsVertical } from 'twenty-ui';

import { useCommandMenu } from '@/command-menu/hooks/useCommandMenu';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';

export const PageHeaderOpenCommandMenuButton = () => {
  const { openCommandMenu } = useCommandMenu();

  const isPageHeaderV2Enabled = useIsFeatureEnabled(
    'IS_PAGE_HEADER_V2_ENABLED',
  );

  return (
    <>
      {isPageHeaderV2Enabled ? (
        <Button
          Icon={IconDotsVertical}
          dataTestId="page-header-open-command-menu-button"
          size="small"
          variant="secondary"
          accent="default"
          shortcut="⌘K"
          ariaLabel="Open command menu"
          onClick={openCommandMenu}
        />
      ) : (
        <IconButton
          Icon={IconDotsVertical}
          size="medium"
          dataTestId="more-showpage-button"
          accent="default"
          variant="secondary"
          onClick={openCommandMenu}
        />
      )}
    </>
  );
};
