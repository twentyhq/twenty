import { Button, IconDotsVertical } from 'twenty-ui';

import { useCommandMenu } from '@/command-menu/hooks/useCommandMenu';

export const PageHeaderOpenCommandMenuButton = () => {
  const { openCommandMenu } = useCommandMenu();

  return (
    <Button
      Icon={IconDotsVertical}
      dataTestId="more-showpage-button"
      size="small"
      variant="secondary"
      accent="default"
      shortcut="⌘K"
      ariaLabel="More"
      onClick={openCommandMenu}
    />
  );
};
