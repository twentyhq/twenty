import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { IconChevronDown } from 'twenty-ui/display';
import { TabButton } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledTabMoreButtonWrapper = styled.div`
  height: ${themeCssVariables.spacing[10]};
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
    <StyledTabMoreButtonWrapper className={className}>
      <TabButton
        id="tab-more-button"
        active={active}
        title={`+${hiddenTabsCount} ${t`More`}`}
        RightIcon={IconChevronDown}
      />
    </StyledTabMoreButtonWrapper>
  );
};
