import { MultiItemFieldInputRow } from '@/object-record/record-field/ui/meta-types/input/components/MultiItemFieldInputRow';
import { MultiItemFieldTextInput } from '@/object-record/record-field/ui/meta-types/input/components/MultiItemFieldTextInput';
import { type MultiItemBaseInputProps } from '@/object-record/record-field/ui/meta-types/input/types/MultiItemBaseInputProps';
import { getMultiItemInputKeyDownHandler } from '@/object-record/record-field/ui/meta-types/input/utils/getMultiItemInputKeyDownHandler';
import { styled } from '@linaria/react';
import { isNonEmptyString } from '@sniptt/guards';
import { type Ref } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme';

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
  ref,
}: MultiItemBaseInputProps & { ref?: Ref<HTMLInputElement> }) => {
  const input = isDefined(renderInput) ? (
    renderInput({
      value,
      onChange,
      autoFocus,
      placeholder,
      hasError,
      onKeyDown: getMultiItemInputKeyDownHandler({
        onEnter,
        onEscape,
        onTab,
        onShiftTab,
        preventTabNavigation,
      }),
      onFocus,
      onBlur,
    })
  ) : (
    <MultiItemFieldTextInput
      ref={ref}
      autoFocus={autoFocus}
      value={value}
      placeholder={placeholder}
      hasError={hasError}
      onChange={onChange}
      onEnter={onEnter}
      onEscape={onEscape}
      onTab={onTab}
      onShiftTab={onShiftTab}
      preventTabNavigation={preventTabNavigation}
      onFocus={onFocus}
      onBlur={onBlur}
    />
  );

  return (
    <>
      <MultiItemFieldInputRow
        className={className}
        rightComponent={rightComponent}
      >
        {input}
      </MultiItemFieldInputRow>
      {isNonEmptyString(error) && <StyledErrorDiv>{error}</StyledErrorDiv>}
    </>
  );
};
