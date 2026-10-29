import { useLingui } from '@lingui/react/macro';
import { styled } from '@linaria/react';
import { type ReactNode } from 'react';
import { LightIconButton } from 'twenty-ui/components/input';
import { IconX } from 'twenty-ui/icon';
import { Chip } from 'twenty-ui/primitives/data-display';
import { themeCssVariables } from 'twenty-ui/theme';

const RECIPIENT_MAX_WIDTH = 240;

const StyledRecipient = styled.span`
  box-sizing: border-box;
  display: inline-flex;
  max-width: min(100%, ${RECIPIENT_MAX_WIDTH}px);
  min-width: 0;
  position: relative;

  &:hover,
  &:focus-within {
    padding-inline-end: ${themeCssVariables.spacing[5]};
  }

  &:hover [data-recipient-removal],
  &:focus-within [data-recipient-removal] {
    opacity: 1;
    pointer-events: auto;
  }

  @media (hover: none) {
    padding-inline-end: ${themeCssVariables.spacing[5]};

    [data-recipient-removal] {
      opacity: 1;
      pointer-events: auto;
    }
  }
`;

const StyledRemoveAction = styled.span`
  display: inline-flex;
  inset-inline-end: 0;
  opacity: 0;
  pointer-events: none;
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
`;

type AiChatNewThreadRecipientChipProps = {
  label: string;
  avatar: ReactNode;
  onRemove: () => void;
  disabled?: boolean;
};

export const AiChatNewThreadRecipientChip = ({
  label,
  avatar,
  onRemove,
  disabled = false,
}: AiChatNewThreadRecipientChipProps) => {
  const { t } = useLingui();

  return (
    <StyledRecipient>
      <Chip
        size="sm"
        variant="soft"
        maxWidth={RECIPIENT_MAX_WIDTH}
        startElement={avatar}
      >
        {label}
      </Chip>
      <StyledRemoveAction data-recipient-removal="">
        <LightIconButton
          size="xs"
          emphasis="subtle"
          variant="soft"
          aria-label={t`Remove ${label}`}
          onClick={onRemove}
          disabled={disabled}
        >
          <IconX />
        </LightIconButton>
      </StyledRemoveAction>
    </StyledRecipient>
  );
};
