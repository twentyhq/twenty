import styled from '@emotion/styled';
import { ReactNode } from 'react';
import { usePreviousHotkeyScope } from '@/ui/utilities/hotkey/hooks/usePreviousHotkeyScope';
import { FormFieldInputHotKeyScope } from '@/object-record/record-field/form-types/constants/FormFieldInputHotKeyScope';

const StyledFormFieldInputContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

export const FormFieldInputContainer = ({
  children,
}: {
  children: ReactNode;
}) => {
  const {
    goBackToPreviousHotkeyScope,
    setHotkeyScopeAndMemorizePreviousScope,
  } = usePreviousHotkeyScope();

  const onFocus = () => {
    setHotkeyScopeAndMemorizePreviousScope(
      FormFieldInputHotKeyScope.FormFieldInput,
    );
  };

  const onBlur = () => {
    goBackToPreviousHotkeyScope();
  };

  return (
    <StyledFormFieldInputContainer onFocus={onFocus} onBlur={onBlur}>
      {children}
    </StyledFormFieldInputContainer>
  );
};
