import { styled } from '@linaria/react';
import { useRef, type KeyboardEvent, type Ref } from 'react';
import { type MultiItemBaseInputProps } from '@/object-record/record-field/ui/meta-types/input/types/MultiItemBaseInputProps';
import { isKeyboardEventComposing } from '@/ui/utilities/hotkey/utils/isKeyboardEventComposing';
import { useListenClickOutside } from '@/ui/utilities/pointer-event/hooks/useListenClickOutside';
import { Key } from 'ts-key-enum';
import { isNonEmptyString } from '@sniptt/guards';
import { themeCssVariables } from 'twenty-ui/theme';
import { isDefined } from 'twenty-shared/utils';
import { Input } from 'twenty-ui/primitives/input';
import { combineRefs } from '~/utils/combineRefs';

const StyledInputContent = styled.div<{ hasRightComponent: boolean }>`
  align-items: center;
  box-sizing: border-box;
  display: flex;
  min-height: ${themeCssVariables.spacing[8]};
  padding-inline-end: ${({ hasRightComponent }) =>
    hasRightComponent ? themeCssVariables.spacing[8] : '0'};
  padding-inline-start: ${themeCssVariables.spacing[2]};
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
  rightComponent,
  renderInput,
  error = '',
  hasError = false,
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

  return (
    <>
      <StyledInputContainer className={className}>
        {isDefined(renderInput) ? (
          renderInput({
            value,
            onChange,
            autoFocus,
            placeholder,
            hasError,
            onKeyDown: handleKeyDown,
            onFocus,
            onBlur,
          })
        ) : (
          <StyledInputContent hasRightComponent={isDefined(rightComponent)}>
            <Input
              variant="plain"
              aria-invalid={hasError || undefined}
              autoFocus={autoFocus}
              value={value}
              placeholder={placeholder}
              onChange={(event) => onChange(event.target.value)}
              ref={combinedRef}
              onFocus={onFocus}
              onBlur={onBlur}
              onKeyDown={handleKeyDown}
            />
          </StyledInputContent>
        )}
        {isDefined(rightComponent) && (
          <StyledRightContainer>{rightComponent}</StyledRightContainer>
        )}
      </StyledInputContainer>
      {isNonEmptyString(error) && <StyledErrorDiv>{error}</StyledErrorDiv>}
    </>
  );
};
