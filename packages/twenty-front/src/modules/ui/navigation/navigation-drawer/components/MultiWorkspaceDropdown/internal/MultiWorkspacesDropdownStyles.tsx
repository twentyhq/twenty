import { styled } from '@linaria/react';
import { IconChevronDown } from 'twenty-ui/display';
import { themeCssVariables } from 'twenty-ui/theme-constants';

export const StyledContainer = styled.div<{
  isNavigationDrawerExpanded: boolean;
}>`
  align-items: center;
  border: 1px solid transparent;
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${themeCssVariables.font.color.primary};
  cursor: pointer;
  display: flex;
  gap: ${({ isNavigationDrawerExpanded }) =>
    isNavigationDrawerExpanded ? themeCssVariables.spacing[1] : '0'};
  height: ${themeCssVariables.spacing[5]};
  justify-content: space-between;
  padding: calc(${themeCssVariables.spacing[1]} - 1px);
  width: ${({ isNavigationDrawerExpanded }) =>
    isNavigationDrawerExpanded ? '100%' : 'auto'};
  &:hover {
    background-color: ${themeCssVariables.background.transparent.lighter};
    border: 1px solid ${themeCssVariables.border.color.medium};
  }
`;

export const StyledLabel = styled.div`
  align-items: center;
  display: flex;
  font-weight: ${themeCssVariables.font.weight.medium};
`;

const StyledIconChevronDownContainer = styled.div<{ disabled?: boolean }>`
  align-items: center;
  color: ${({ disabled }) =>
    disabled
      ? themeCssVariables.font.color.extraLight
      : themeCssVariables.font.color.tertiary};
  display: flex;
`;

export const StyledIconChevronDown = ({
  disabled,
  ...props
}: { disabled?: boolean } & React.ComponentProps<typeof IconChevronDown>) => (
  <StyledIconChevronDownContainer disabled={disabled}>
    {/* oxlint-disable-next-line react/jsx-props-no-spreading */}
    <IconChevronDown {...props} />
  </StyledIconChevronDownContainer>
);
