import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { IconChevronDown } from 'twenty-ui/display';
import { TabButton } from 'twenty-ui/input';

import { TAB_LIST_HEIGHT } from '@/ui/layout/tab-list/constants/TabListHeight';

const StyledTabMoreButtonContainer = styled.div`
  display: flex;
  height: ${TAB_LIST_HEIGHT};
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
