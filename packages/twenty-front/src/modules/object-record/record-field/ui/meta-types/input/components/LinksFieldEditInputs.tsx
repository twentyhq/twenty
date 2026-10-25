import { getMultiItemInputKeyDownHandler } from '@/object-record/record-field/ui/meta-types/input/utils/getMultiItemInputKeyDownHandler';
import { TextInput } from '@/ui/input/components/TextInput';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useCallback } from 'react';
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
  hasError: boolean;
  onUrlChange: (url: string) => void;
  onLabelChange: (label: string) => void;
  onEnter: () => void;
  onEscape?: () => void;
  onUrlBlur?: () => void;
};

export const LinksFieldEditInputs = ({
  url,
  label,
  hasError,
  onUrlChange,
  onLabelChange,
  onEnter,
  onEscape,
  onUrlBlur,
}: LinksFieldEditInputsProps) => {
  const scrollIntoViewOnMount = useCallback((node: HTMLDivElement | null) => {
    node?.scrollIntoView({ block: 'nearest' });
  }, []);

  const handleKeyDown = getMultiItemInputKeyDownHandler({ onEnter, onEscape });

  return (
    <StyledLinksFieldEditInputsContainer ref={scrollIntoViewOnMount}>
      <TextInput
        label={t`URL`}
        value={url}
        onChange={onUrlChange}
        onBlur={onUrlBlur}
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
