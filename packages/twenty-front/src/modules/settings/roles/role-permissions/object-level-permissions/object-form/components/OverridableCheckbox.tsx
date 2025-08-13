import { keyframes, useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { IconReload, IconX } from 'twenty-ui/display';
import { Checkbox } from 'twenty-ui/input';

export type OverridableCheckboxType = 'default' | 'override' | 'no_cta';

const StyledOverridableCheckboxContainer = styled.div`
  align-items: center;
  display: inline-flex;
  justify-content: flex-start;
  width: 48px;
`;

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(90deg); }
`;

const StyledIconReload = styled(IconReload)`
  &:hover {
    animation: ${spin} 250ms linear forwards;
  }
`;

const StyledOverridableCheckboxContainerItem = styled.div`
  align-items: center;
  display: flex;
  height: 24px;
  justify-content: center;
  width: 24px;
`;

const StyledIconWrapper = styled.div<{
  isDisabled?: boolean;
}>`
  align-items: center;
  cursor: ${({ isDisabled }) => (isDisabled ? 'not-allowed' : 'pointer')};
  display: flex;
  height: 100%;
  justify-content: center;
  opacity: ${({ isDisabled }) => (isDisabled ? 0.5 : 1)};
  width: 100%;
`;

export type OverridableCheckboxProps = {
  type?: OverridableCheckboxType;
  onChange: () => void;
  checked: boolean;
  disabled: boolean;
};

export const OverridableCheckbox = ({
  type = 'default',
  onChange,
  checked,
  disabled,
}: OverridableCheckboxProps) => {
  const theme = useTheme();

  return (
    <StyledOverridableCheckboxContainer>
      {type === 'default' && (
        <>
          <StyledOverridableCheckboxContainerItem>
            <Checkbox checked={true} disabled={true} />
          </StyledOverridableCheckboxContainerItem>
          <StyledOverridableCheckboxContainerItem>
            <StyledIconWrapper
              onClick={disabled ? undefined : onChange}
              isDisabled={disabled}
            >
              {!disabled && (
                <IconX
                  size={theme.icon.size.md}
                  color={theme.font.color.secondary}
                />
              )}
            </StyledIconWrapper>
          </StyledOverridableCheckboxContainerItem>
        </>
      )}
      {type === 'override' && (
        <>
          <StyledOverridableCheckboxContainerItem>
            <Checkbox checked={false} disabled={true} />
          </StyledOverridableCheckboxContainerItem>
          <StyledOverridableCheckboxContainerItem>
            <StyledIconWrapper
              onClick={disabled ? undefined : onChange}
              isDisabled={disabled}
            >
              <StyledIconReload
                size={theme.icon.size.md}
                color={theme.adaptiveColors.orange4}
              />
            </StyledIconWrapper>
          </StyledOverridableCheckboxContainerItem>
        </>
      )}
      {type === 'no_cta' && (
        <StyledOverridableCheckboxContainerItem>
          <Checkbox checked={checked} disabled={disabled} onChange={onChange} />
        </StyledOverridableCheckboxContainerItem>
      )}
    </StyledOverridableCheckboxContainer>
  );
};
