import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { IconChevronDown } from 'twenty-ui/icon';
import { TabButton } from 'twenty-ui/components';

import { TAB_LIST_HEIGHT } from '@/ui/layout/tab-list/constants/TabListHeight';
import { TAB_LIST_ROW_HEIGHT_CSS_VARIABLE } from '@/ui/layout/tab-list/constants/TabListRowHeightCssVariable';

const TAB_MORE_BUTTON_TEST_ID = 'tab-tab-more-button';

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
  const testId = disableTestId ? undefined : TAB_MORE_BUTTON_TEST_ID;

  return (
    <StyledTabMoreButtonContainer>
      <TabButton
        data-testid={testId}
        active={active}
        children={`+${hiddenTabsCount} ${t`More`}`}
        endIcon={<IconChevronDown />}
        className={className}
      />
    </StyledTabMoreButtonContainer>
  );
};
