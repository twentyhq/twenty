import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { IconChevronDown } from 'twenty-ui/icon';
import { Dropdown, TabButton } from 'twenty-ui/components/navigation';

import { TAB_LIST_HEIGHT } from '@/ui/layout/tab-list/constants/TabListHeight';
import { TAB_LIST_ROW_HEIGHT_CSS_VARIABLE } from '@/ui/layout/tab-list/constants/TabListRowHeightCssVariable';

const TAB_MORE_BUTTON_TEST_ID = 'tab-tab-more-button';

const StyledTabMoreButtonContainer = styled.div`
  display: flex;
  height: var(${TAB_LIST_ROW_HEIGHT_CSS_VARIABLE}, ${TAB_LIST_HEIGHT});
`;

type TabMoreButtonProps = {
  hiddenTabsCount: number;
  active: boolean;
  className?: string;
  disableTestId?: boolean;
  isDropdownTrigger?: boolean;
};

export const TabMoreButton = ({
  hiddenTabsCount,
  active,
  className,
  disableTestId,
  isDropdownTrigger = false,
}: TabMoreButtonProps) => {
  const testId = disableTestId ? undefined : TAB_MORE_BUTTON_TEST_ID;

  const tabButton = (
    <TabButton
      data-testid={testId}
      active={active}
      children={`+${hiddenTabsCount} ${t`More`}`}
      endIcon={<IconChevronDown />}
      className={className}
    />
  );

  return (
    <StyledTabMoreButtonContainer>
      {isDropdownTrigger ? <Dropdown.Trigger render={tabButton} /> : tabButton}
    </StyledTabMoreButtonContainer>
  );
};
