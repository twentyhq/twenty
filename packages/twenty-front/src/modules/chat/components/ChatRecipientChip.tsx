import { useLingui } from '@lingui/react/macro';
import { styled } from '@linaria/react';
import { type ReactNode } from 'react';
import { LightIconButton } from 'twenty-ui/components/input';
import { IconX } from 'twenty-ui/icon';
import { Chip } from 'twenty-ui/primitives/data-display';
import { themeCssVariables } from 'twenty-ui/theme';

const RECIPIENT_MAX_WIDTH = 240;

const StyledRecipient = styled.div`
  display: inline-flex;
  max-width: 100%;
  min-width: 0;
  position: relative;

  &:hover [data-recipient-removal],
  &:focus-within [data-recipient-removal] {
    opacity: 1;
    pointer-events: auto;
  }
`;

const StyledRemoveAction = styled.span`
  display: inline-flex;

  @media (hover: hover) {
    backdrop-filter: ${themeCssVariables.blur.light};
    border-bottom-right-radius: ${themeCssVariables.border.radius.smRound};
    border-top-right-radius: ${themeCssVariables.border.radius.smRound};
    corner-shape: round;
    opacity: 0;
    pointer-events: none;
    position: absolute;
    right: 0;
    top: 0;
  }
`;

type ChatRecipientChipProps = {
  label: string;
  avatar: ReactNode;
  onRemove: () => void;
  disabled?: boolean;
};

export const ChatRecipientChip = ({
  label,
  avatar,
  onRemove,
  disabled = false,
}: ChatRecipientChipProps) => {
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
