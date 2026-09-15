import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { IconChevronDown } from 'twenty-ui/icon';
import { TabButton } from 'twenty-ui/input';

import { TAB_LIST_HEIGHT } from '@/ui/layout/tab-list/constants/TabListHeight';
import { TAB_LIST_ROW_HEIGHT_CSS_VARIABLE } from '@/ui/layout/tab-list/constants/TabListRowHeightCssVariable';

// The dropdown wraps its clickable component in a fit-content box, so the row
// height cannot be inherited and reaches the button through the variable the
// tab list sets.
const StyledTabMoreButtonContainer = styled.div`
  display: flex;
  height: var(${TAB_LIST_ROW_HEIGHT_CSS_VARIABLE}, ${TAB_LIST_HEIGHT});
`;

export const TabMoreButton = ({
  hiddenTabsCount,
  active,
  className,
}: {
  hiddenTabsCount: number;
  active: boolean;
  className?: string;
}) => {
  return (
    <StyledTabMoreButtonContainer>
      <TabButton
        id="tab-more-button"
        active={active}
        title={`+${hiddenTabsCount} ${t`More`}`}
        RightIcon={IconChevronDown}
        className={className}
      />
    </StyledTabMoreButtonContainer>
  );
};
