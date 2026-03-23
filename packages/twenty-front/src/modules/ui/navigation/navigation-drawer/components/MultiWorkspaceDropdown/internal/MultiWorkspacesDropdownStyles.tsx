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
    isNavigationDrawerExpanded ? themeCssVariables.spacing[2] : '0'};
  max-width: 100%;
  min-width: 0;
  padding: calc(${themeCssVariables.spacing[1]} - 1px);
  &:hover {
    background-color: ${themeCssVariables.background.transparent.lighter};
    border: 1px solid ${themeCssVariables.border.color.medium};
  }
`;

export const StyledLabelWrapper = styled.div`
  flex: 1 1 auto;
  min-width: 0;
  overflow: hidden;
`;

export const StyledLabel = styled.div`
  font-weight: ${themeCssVariables.font.weight.medium};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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
