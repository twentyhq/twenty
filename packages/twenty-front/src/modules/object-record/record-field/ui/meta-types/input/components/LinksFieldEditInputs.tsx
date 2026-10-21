import { TextInput } from '@/ui/input/components/TextInput';
import { isKeyboardEventComposing } from '@/ui/utilities/hotkey/utils/isKeyboardEventComposing';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { type KeyboardEvent, useCallback } from 'react';
import { Key } from 'ts-key-enum';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledLinksFieldEditInputsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing[1]};
`;

type LinksFieldEditInputsProps = {
  url: string;
  label: string;
  urlPlaceholder?: string;
  hasError: boolean;
  onUrlChange: (url: string) => void;
  onLabelChange: (label: string) => void;
  onEnter: () => void;
};

export const LinksFieldEditInputs = ({
  url,
  label,
  urlPlaceholder,
  hasError,
  onUrlChange,
  onLabelChange,
  onEnter,
}: LinksFieldEditInputsProps) => {
  const scrollIntoViewOnMount = useCallback((node: HTMLDivElement | null) => {
    node?.scrollIntoView({ block: 'nearest' });
  }, []);

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
    <StyledLinksFieldEditInputsContainer ref={scrollIntoViewOnMount}>
      <TextInput
        label={t`URL`}
        value={url}
        placeholder={urlPlaceholder}
        onChange={onUrlChange}
        onKeyDown={handleKeyDown}
        error={hasError ? t`Enter a valid URL` : undefined}
        noErrorHelper
        autoFocus
        fullWidth
      />
      <TextInput
        label={t`Label`}
        value={label}
        placeholder={url}
        onChange={onLabelChange}
        onKeyDown={handleKeyDown}
        fullWidth
      />
    </StyledLinksFieldEditInputsContainer>
  );
};
