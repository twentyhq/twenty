import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { IconChevronDown } from 'twenty-ui/display';
import { TabButton } from 'twenty-ui/input';

const StyledTabMoreButton = styled(TabButton)`
  height: ${({ theme }) => theme.spacing(10)};
`;

export const TabMoreButton = ({
  hiddenTabsCount,
  active,
}: {
  hiddenTabsCount: number;
  active: boolean;
}) => {
  return (
    <StyledTabMoreButton
      id="tab-more-button"
      active={active}
      title={`+${hiddenTabsCount} ${t`More`}`}
      RightIcon={IconChevronDown}
    />
  );
};
