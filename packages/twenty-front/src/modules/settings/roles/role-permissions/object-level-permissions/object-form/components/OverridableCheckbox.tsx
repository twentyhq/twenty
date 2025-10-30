import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { IconReload, IconX } from 'twenty-ui/display';
import { Checkbox } from 'twenty-ui/input';
import { AnimatedRotate } from 'twenty-ui/utilities';

export type OverridableCheckboxType = 'default' | 'override' | 'no_cta';

const StyledOverridableCheckboxContainer = styled.div`
  align-items: center;
  display: inline-flex;
  justify-content: flex-start;
  width: ${({ theme }) => theme.icon.size.xl * 2}px;
`;

const StyledOverridableCheckboxContainerItem = styled.div`
  align-items: center;
  display: flex;
  height: ${({ theme }) => theme.icon.size.xl}px;
  justify-content: center;
  width: ${({ theme }) => theme.icon.size.xl}px;
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
                <AnimatedRotate>
                  <IconX
                    size={theme.icon.size.md}
                    color={theme.font.color.secondary}
                  />
                </AnimatedRotate>
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
              <AnimatedRotate animateOnHover={!disabled}>
                <IconReload
                  size={theme.icon.size.md}
                  color={theme.color.orange8}
                />
              </AnimatedRotate>
            </StyledIconWrapper>
          </StyledOverridableCheckboxContainerItem>
        </>
      )}
      {type === 'no_cta' && (
        <StyledOverridableCheckboxContainerItem>
          <AnimatedRotate>
            <Checkbox
              checked={checked}
              disabled={disabled}
              onChange={onChange}
            />
          </AnimatedRotate>
        </StyledOverridableCheckboxContainerItem>
      )}
    </StyledOverridableCheckboxContainer>
  );
};
