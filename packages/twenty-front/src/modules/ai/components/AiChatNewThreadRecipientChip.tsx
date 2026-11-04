import { useLingui } from '@lingui/react/macro';
import { styled } from '@linaria/react';
import { type ReactNode } from 'react';
import { LightIconButton } from 'twenty-ui/components/input';
import { IconX } from 'twenty-ui/icon';
import { Chip } from 'twenty-ui/primitives/data-display';

const RECIPIENT_MAX_WIDTH = 240;

const StyledRecipient = styled.div`
  display: inline-flex;
  max-width: 100%;
  min-width: 0;

  &:hover [data-recipient-removal],
  &:focus-within [data-recipient-removal] {
    opacity: 1;
    pointer-events: auto;
  }

  @media (hover: none) {
    [data-recipient-removal] {
      opacity: 1;
      pointer-events: auto;
    }
  }
`;

const StyledRemoveAction = styled.span`
  display: inline-flex;
  opacity: 0;
  pointer-events: none;
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
        endElement={
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
        }
      >
        {label}
      </Chip>
    </StyledRecipient>
  );
};
