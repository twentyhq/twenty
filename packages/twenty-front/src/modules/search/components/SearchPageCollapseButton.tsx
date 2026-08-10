import { useLingui } from '@lingui/react/macro';
import { IconLayoutSidebarRightCollapse } from 'twenty-ui/icon';
import { IconButton } from 'twenty-ui/input';

import { useCollapseSearchToSidePanel } from '@/search/hooks/useCollapseSearchToSidePanel';

export const SearchPageCollapseButton = () => {
  const { t } = useLingui();
  const collapseSearchToSidePanel = useCollapseSearchToSidePanel();

  return (
    <IconButton
      Icon={IconLayoutSidebarRightCollapse}
      size="small"
      variant="tertiary"
      onClick={collapseSearchToSidePanel}
      ariaLabel={t`Collapse to side panel`}
    />
  );
};
