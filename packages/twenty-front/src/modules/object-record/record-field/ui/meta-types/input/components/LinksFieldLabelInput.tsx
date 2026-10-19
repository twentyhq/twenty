import { TextInput } from '@/ui/input/components/TextInput';
import { isKeyboardEventComposing } from '@/ui/utilities/hotkey/utils/isKeyboardEventComposing';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { type KeyboardEvent } from 'react';
import { Key } from 'ts-key-enum';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledLinksFieldLabelInputContainer = styled.div`
  padding: ${themeCssVariables.spacing[1]};
`;

type LinksFieldLabelInputProps = {
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
  onEnter: () => void;
};

export const LinksFieldLabelInput = ({
  value,
  placeholder,
  onChange,
  onEnter,
}: LinksFieldLabelInputProps) => {
  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (
      event.key !== Key.Enter ||
      isKeyboardEventComposing(event.nativeEvent)
    ) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    onEnter();
  };

  return (
    <StyledLinksFieldLabelInputContainer>
      <TextInput
        label={t`Label`}
        value={value}
        placeholder={placeholder}
        onChange={onChange}
        onKeyDown={handleKeyDown}
        autoFocus
        fullWidth
      />
    </StyledLinksFieldLabelInputContainer>
  );
};
