import { styled } from '@linaria/react';
import {
  forwardRef,
  useRef,
  type InputHTMLAttributes,
  type ReactNode,
} from 'react';
import 'react-phone-number-input/style.css';

import { useRegisterInputEvents } from '@/object-record/record-field/ui/meta-types/input/hooks/useRegisterInputEvents';
import { isDefined } from 'twenty-shared/utils';
import { useCombinedRefs } from '~/hooks/useCombinedRefs';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledInput = styled.input<{
  withRightComponent?: boolean;
  hasError?: boolean;
}>`
  background-color: transparent;
  border: none;
  color: ${themeCssVariables.font.color.primary};
  font-family: ${themeCssVariables.font.family};
  font-size: inherit;
  font-weight: inherit;
  outline: none;
  padding: ${themeCssVariables.spacing[0]} ${themeCssVariables.spacing[2]};

  &::placeholder,
  &::-webkit-input-placeholder {
    color: ${themeCssVariables.font.color.light};
    font-family: ${themeCssVariables.font.family};
    font-weight: ${themeCssVariables.font.weight.medium};
  }

  box-sizing: border-box;
  font-weight: ${themeCssVariables.font.weight.medium};
  height: 32px;
  position: relative;
  width: 100%;

  padding-right: ${({ withRightComponent }) =>
    withRightComponent ? '32px' : '0'};
`;

const StyledInputContainer = styled.div`
  background-color: transparent;
  box-sizing: border-box;
  position: relative;
  width: 100%;

  &:not(:first-of-type) {
    padding: ${themeCssVariables.spacing[1]};
  }
`;

const StyledRightContainer = styled.div`
  position: absolute;
  right: ${themeCssVariables.spacing[2]};
  top: 50%;
  transform: translateY(-50%);
`;

const StyledErrorDiv = styled.div`
  color: ${themeCssVariables.color.red};
  padding: 0 ${themeCssVariables.spacing[2]};
`;

type HTMLInputProps = InputHTMLAttributes<HTMLInputElement>;

export type DropdownMenuInputProps = HTMLInputProps & {
  instanceId: string;
  onClickOutside?: () => void;
  onEnter?: () => void;
  onEscape?: () => void;
  onShiftTab?: () => void;
  onTab?: () => void;
  rightComponent?: ReactNode;
  renderInput?: (props: {
    value: HTMLInputProps['value'];
    onChange: HTMLInputProps['onChange'];
    autoFocus: HTMLInputProps['autoFocus'];
    placeholder: HTMLInputProps['placeholder'];
  }) => React.ReactNode;
  error?: string | null;
  hasError?: boolean;
};

export const DropdownMenuInput = forwardRef<
  HTMLInputElement,
  DropdownMenuInputProps
>(
  (
    {
      autoFocus,
      className,
      value,
      placeholder,
      instanceId,
      onChange,
      onClickOutside,
      onEnter = () => {},
      onEscape = () => {},
      onShiftTab,
      onTab,
      rightComponent,
      renderInput,
      error = '',
      hasError = false,
    },
    ref,
  ) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const combinedRef = useCombinedRefs(ref, inputRef);

    useRegisterInputEvents({
      focusId: instanceId,
      inputRef,
      inputValue: value,
      onEnter,
      onEscape,
      onClickOutside,
      onTab,
      onShiftTab,
    });

    return (
      <>
        <StyledInputContainer className={className}>
          {renderInput ? (
            renderInput({
              value,
              onChange,
              autoFocus,
              placeholder,
            })
          ) : (
            <StyledInput
              hasError={hasError}
              autoFocus={autoFocus}
              value={value}
              placeholder={placeholder}
              onChange={onChange}
              ref={combinedRef}
              withRightComponent={isDefined(rightComponent)}
            />
          )}
          {isDefined(rightComponent) && (
            <StyledRightContainer>{rightComponent}</StyledRightContainer>
          )}
        </StyledInputContainer>
        {error && <StyledErrorDiv>{error}</StyledErrorDiv>}
      </>
    );
  },
);
