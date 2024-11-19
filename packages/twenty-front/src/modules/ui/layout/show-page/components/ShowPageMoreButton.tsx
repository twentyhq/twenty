import { IconButton, IconDotsVertical } from 'twenty-ui';

import { useCommandMenu } from '@/command-menu/hooks/useCommandMenu';

export const ShowPageMoreButton = () => {
  const { openCommandMenu } = useCommandMenu();

  return (
    <IconButton
      Icon={IconDotsVertical}
      size="medium"
      dataTestId="more-showpage-button"
      accent="default"
      variant="secondary"
      onClick={openCommandMenu}
    />
  );
};
