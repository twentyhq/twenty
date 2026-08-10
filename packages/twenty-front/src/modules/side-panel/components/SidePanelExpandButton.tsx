import { isDefined } from 'twenty-shared/utils';
import { IconLayoutSidebarRightExpand } from 'twenty-ui/icon';
import { IconButton } from 'twenty-ui/input';

import { useSidePanelExpandTarget } from '@/side-panel/hooks/useSidePanelExpandTarget';

export const SidePanelExpandButton = () => {
  const expandTarget = useSidePanelExpandTarget();

  if (!isDefined(expandTarget)) {
    return null;
  }

  return (
    <IconButton
      Icon={IconLayoutSidebarRightExpand}
      size="small"
      variant="tertiary"
      onClick={expandTarget.expand}
      ariaLabel={expandTarget.label}
    />
  );
};
