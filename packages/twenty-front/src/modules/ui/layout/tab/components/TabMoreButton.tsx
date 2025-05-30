import { useTheme } from '@emotion/react';
import { t } from '@lingui/core/macro';
import { Avatar, IconChevronDown } from 'twenty-ui/display';
import {
  StyledTabHover,
  StyledTabIconContainer,
  StyledTabMoreButton,
} from './TabSharedStyles';

export const TabMoreButton = ({
  hiddenTabsCount,
  active,
}: {
  hiddenTabsCount: number;
  active: boolean;
}) => {
  const theme = useTheme();

  return (
    <StyledTabMoreButton active={active}>
      <StyledTabHover>
        +{hiddenTabsCount} {t`More`}
        <StyledTabIconContainer>
          <Avatar
            Icon={IconChevronDown}
            size="md"
            placeholder={'+' + hiddenTabsCount + ' ' + t`More`}
            iconColor={
              active ? theme.font.color.primary : theme.font.color.secondary
            }
          />
        </StyledTabIconContainer>
      </StyledTabHover>
    </StyledTabMoreButton>
  );
};
