import isPropValid from '@emotion/is-prop-valid';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { Avatar, IconChevronDown } from 'twenty-ui/display';

const StyledTabMoreButton = styled('button', {
  shouldForwardProp: (prop) => isPropValid(prop) && prop !== 'active',
})<{ active?: boolean; disabled?: boolean; to?: string }>`
  all: unset;
  align-items: center;
  color: ${({ theme, active, disabled }) =>
    active
      ? theme.font.color.primary
      : disabled
        ? theme.font.color.light
        : theme.font.color.secondary};
  cursor: pointer;
  background-color: transparent;
  border: none;
  font-family: inherit;
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
  justify-content: center;
  padding: ${({ theme }) => theme.spacing(2) + ' 0'};
  pointer-events: ${({ disabled }) => (disabled ? 'none' : '')};
  text-decoration: none;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 1px;
    background-color: ${({ theme, active }) =>
      active ? theme.border.color.inverted : 'transparent'};
    z-index: 1;
  }
`;

const StyledHover = styled.span`
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
  padding: ${({ theme }) => theme.spacing(1)};
  padding-left: ${({ theme }) => theme.spacing(2)};
  padding-right: ${({ theme }) => theme.spacing(2)};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  width: 100%;
  &:hover {
    background: ${({ theme }) => theme.background.tertiary};
    border-radius: ${({ theme }) => theme.border.radius.sm};
  }
  &:active {
    background: ${({ theme }) => theme.background.quaternary};
  }
`;

const StyledIconContainer = styled.div`
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
`;

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
      <StyledHover>
        +{hiddenTabsCount} {t`More`}
        <StyledIconContainer>
          <Avatar
            Icon={IconChevronDown}
            size="md"
            placeholder={'+' + hiddenTabsCount + ' ' + t`More`}
            iconColor={
              active ? theme.font.color.primary : theme.font.color.secondary
            }
          />
        </StyledIconContainer>
      </StyledHover>
    </StyledTabMoreButton>
  );
};
