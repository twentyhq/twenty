import { styled } from '@linaria/react';
import { type ComponentProps, createElement } from 'react';
import { t } from '@lingui/core/macro';
import { IconChevronDown } from 'twenty-ui/icon';
import { TabButton } from 'twenty-ui/components/navigation';

import { TAB_LIST_HEIGHT } from '@/ui/layout/tab-list/constants/TabListHeight';
import { TAB_LIST_ROW_HEIGHT_CSS_VARIABLE } from '@/ui/layout/tab-list/constants/TabListRowHeightCssVariable';

const TAB_MORE_BUTTON_TEST_ID = 'tab-tab-more-button';

const StyledTabMoreButtonContainer = styled.div`
  display: flex;
  height: var(${TAB_LIST_ROW_HEIGHT_CSS_VARIABLE}, ${TAB_LIST_HEIGHT});
`;

type TabMoreButtonProps = Omit<ComponentProps<typeof TabButton>, 'children'> & {
  hiddenTabsCount: number;
  active: boolean;
  disableTestId?: boolean;
};

export const TabMoreButton = ({
  hiddenTabsCount,
  active,
  className,
  disableTestId,
  ref,
  ...props
}: TabMoreButtonProps) => {
  const testId = disableTestId ? undefined : TAB_MORE_BUTTON_TEST_ID;
  const tabButtonProps = {
    ...props,
    ref,
    'data-testid': testId,
    active,
    children: `+${hiddenTabsCount} ${t`More`}`,
    endIcon: <IconChevronDown />,
    className,
  };

  return (
    <StyledTabMoreButtonContainer>
      {createElement(TabButton, tabButtonProps)}
    </StyledTabMoreButtonContainer>
  );
};
