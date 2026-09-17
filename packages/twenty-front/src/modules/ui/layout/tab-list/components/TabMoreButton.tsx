import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { IconChevronDown } from 'twenty-ui/icon';
import { TabListButton } from '@/ui/layout/tab-list/components/TabListButton';

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
  disableTestId,
}: {
  hiddenTabsCount: number;
  active: boolean;
  className?: string;
  disableTestId?: boolean;
}) => {
  return (
    <StyledTabMoreButtonContainer>
      <TabListButton
        id="tab-more-button"
        active={active}
        title={`+${hiddenTabsCount} ${t`More`}`}
        RightIcon={IconChevronDown}
        className={className}
        disableTestId={disableTestId}
      />
    </StyledTabMoreButtonContainer>
  );
};
