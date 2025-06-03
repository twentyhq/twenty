import { useTheme } from '@emotion/react';
import { t } from '@lingui/core/macro';
import { IconChevronDown } from 'twenty-ui/display';
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
          <IconChevronDown
            size={theme.icon.size.sm}
            color={
              active ? theme.font.color.primary : theme.font.color.secondary
            }
          />
        </StyledTabIconContainer>
      </StyledTabHover>
    </StyledTabMoreButton>
  );
};
