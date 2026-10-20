import { styled } from '@linaria/react';
import { useRef, type KeyboardEvent, type Ref } from 'react';
import { type MultiItemBaseInputProps } from '@/object-record/record-field/ui/meta-types/input/types/MultiItemBaseInputProps';
import { isKeyboardEventComposing } from '@/ui/utilities/hotkey/utils/isKeyboardEventComposing';
import { useListenClickOutside } from '@/ui/utilities/pointer-event/hooks/useListenClickOutside';
import { Key } from 'ts-key-enum';
import { isNonEmptyString } from '@sniptt/guards';
import { themeCssVariables } from 'twenty-ui/theme';
import { isDefined } from 'twenty-shared/utils';
import { combineRefs } from '~/utils/combineRefs';

const StyledInput = styled.input<{
  withRightComponent?: boolean;
  hasError?: boolean;
  hasItem: boolean;
}>`
  background-color: ${({ hasItem }) =>
    hasItem ? themeCssVariables.background.transparent.lighter : 'transparent'};
  background-color: transparent;
  border: ${({ hasItem, hasError }) =>
    hasItem
      ? hasError
        ? `1px solid ${themeCssVariables.border.color.danger}`
        : `1px solid ${themeCssVariables.border.color.medium}`
      : 'none'};
  border: none;
  border-radius: ${({ hasItem }) => (hasItem ? '4px' : '0')};
  box-sizing: border-box;
  color: ${themeCssVariables.font.color.primary};
  font-family: ${themeCssVariables.font.family};

  &::placeholder,
  &::-webkit-input-placeholder {
    color: ${themeCssVariables.font.color.light};
    font-family: ${themeCssVariables.font.family};
    font-weight: ${themeCssVariables.font.weight.medium};
  }

  font-size: inherit;
  font-weight: ${themeCssVariables.font.weight.medium};
  font-weight: inherit;
  height: 32px;
  min-width: 0;
  outline: none;
  padding: ${themeCssVariables.spacing[0]} ${themeCssVariables.spacing[2]};
  padding-right: ${({ withRightComponent }) =>
    withRightComponent ? '32px' : '0'};
  position: relative;

  width: 100%;

  &[data-in-row='true'] {
    height: 100%;
    padding-left: ${themeCssVariables.spacing[1]};
    padding-right: ${themeCssVariables.spacing[2]};
  }
`;

export const StyledMultiItemBaseInputContainer = styled.div`
  background-color: transparent;
  box-sizing: border-box;
  position: relative;
  width: 100%;

  &:not(:first-of-type) {
    padding: ${themeCssVariables.spacing[1]};
  }

  &[data-has-left-component='true'] {
    display: flex;
  }

  &[data-in-row='true'] {
    align-items: center;
    display: flex;
    gap: ${themeCssVariables.spacing[1]};
    height: 32px;
    padding: 0 ${themeCssVariables.spacing[1]} 0 0;
  }

  &[data-in-row='true'][data-has-error='true'] input {
    color: ${themeCssVariables.color.red};
  }
`;

const StyledInputRowContent = styled.div`
  align-items: center;
  align-self: stretch;
  display: flex;
  flex: 1;
  min-width: 0;
`;

const StyledRightContainer = styled.div`
  position: absolute;
  right: ${themeCssVariables.spacing[2]};
  top: 50%;
  transform: translateY(-50%);

  &[data-has-item='false'] {
    right: ${themeCssVariables.spacing[1]};
  }
`;

const StyledErrorDiv = styled.div`
  color: ${themeCssVariables.color.red};
  padding: 0 ${themeCssVariables.spacing[2]};
`;

export const MultiItemBaseInput = ({
  autoFocus,
  className,
  value,
  placeholder,
  onChange,
  onClickOutside,
  onEnter,
  onEscape,
  onShiftTab,
  onTab,
  preventTabNavigation = false,
  onFocus,
  onBlur,
  leftComponent,
  rightComponent,
  renderInput,
  error = '',
  hasError = false,
  hasItem,
  isInRow = false,
  instanceId,
  ref,
}: MultiItemBaseInputProps & { ref?: Ref<HTMLInputElement> }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const combinedRef = combineRefs(ref, inputRef);

  useListenClickOutside({
    refs: [inputRef],
    callback: () => onClickOutside?.(),
    listenerId: instanceId,
    enabled: isDefined(onClickOutside),
  });

  const getKeyDownHandler = (event: KeyboardEvent<HTMLInputElement>) => {
    switch (event.key) {
      case Key.Enter:
        return onEnter;
      case Key.Escape:
        return onEscape;
      case Key.Tab:
        return event.shiftKey ? onShiftTab : onTab;
      default:
        return undefined;
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    const hasUnsupportedModifier =
      event.altKey ||
      event.ctrlKey ||
      event.metaKey ||
      (event.shiftKey && event.key !== Key.Tab);

    if (isKeyboardEventComposing(event.nativeEvent) || hasUnsupportedModifier) {
      return;
    }

    if (event.key === Key.Tab && preventTabNavigation) {
      event.preventDefault();
    }

    const handler = getKeyDownHandler(event);

    if (!isDefined(handler)) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    handler();
  };

  const input = isDefined(renderInput) ? (
    renderInput({
      value,
      onChange,
      autoFocus,
      placeholder,
      hasError,
      isInRow,
      onKeyDown: handleKeyDown,
      onFocus,
      onBlur,
    })
  ) : (
    <StyledInput
      hasError={hasError}
      autoFocus={autoFocus}
      value={value}
      placeholder={placeholder}
      onChange={(event) => onChange(event.target.value)}
      ref={combinedRef}
      withRightComponent={isDefined(rightComponent) && !isInRow}
      hasItem={hasItem}
      data-in-row={isInRow}
      onFocus={onFocus}
      onBlur={onBlur}
      onKeyDown={handleKeyDown}
    />
  );

  return (
    <>
      <StyledMultiItemBaseInputContainer
        className={className}
        data-in-row={isInRow}
        data-has-error={hasError}
        data-has-left-component={isDefined(leftComponent)}
      >
        {isInRow ? (
          <StyledInputRowContent>
            {leftComponent}
            {input}
          </StyledInputRowContent>
        ) : (
          <>
            {leftComponent}
            {input}
          </>
        )}
        {isDefined(rightComponent) &&
          (isInRow ? (
            rightComponent
          ) : (
            <StyledRightContainer data-has-item={hasItem}>
              {rightComponent}
            </StyledRightContainer>
          ))}
      </StyledMultiItemBaseInputContainer>
      {isNonEmptyString(error) && <StyledErrorDiv>{error}</StyledErrorDiv>}
    </>
  );
};
