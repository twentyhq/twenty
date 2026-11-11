import { styled } from '@linaria/react';
import { type MouseEvent } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { LightIconButton } from 'twenty-ui/components/input';
import { IconX } from 'twenty-ui/icon';
import { Avatar, Chip } from 'twenty-ui/primitives/data-display';
import { themeCssVariables } from 'twenty-ui/theme';

import { type EmailRecipientResolution } from '@/activities/emails/recipients/hooks/useEmailRecipientsResolution';
import { type EmailRecipient } from '@/activities/emails/recipients/types/EmailRecipient';
import { getEmailIdentityDisplayName } from '@/activities/emails/utils/getEmailIdentityDisplayName';
import { getAbsoluteImageUrl } from '~/utils/image/getAbsoluteImageUrl';

const CHIP_MAX_WIDTH = 240;

const StyledRemove = styled.span`
  align-items: center;
  background: ${themeCssVariables.background.tertiary};
  border-bottom-right-radius: ${themeCssVariables.border.radius.smRound};
  border-top-right-radius: ${themeCssVariables.border.radius.smRound};
  bottom: 0;
  corner-shape: round;
  display: flex;
  opacity: 0;
  pointer-events: none;
  position: absolute;
  right: 0;
  top: 0;

  @media (hover: none) {
    opacity: 1;
    pointer-events: auto;
  }
`;

const StyledContainer = styled.span`
  border-radius: ${themeCssVariables.border.radius.smRound};
  corner-shape: round;
  display: inline-flex;
  max-width: 100%;
  min-width: 0;
  position: relative;

  &[data-selected='true'] {
    background: ${themeCssVariables.background.transparent.blue};
    box-shadow: 0 0 0 1px ${themeCssVariables.color.blue};
  }

  &[data-invalid='true'] {
    background: ${themeCssVariables.color.red3};
    box-shadow: 0 0 0 1px ${themeCssVariables.color.red5};
  }

  &[data-invalid='true'][data-selected='true'] {
    box-shadow: 0 0 0 1px ${themeCssVariables.color.red};
  }

  &:hover ${StyledRemove}, &:focus-within ${StyledRemove} {
    opacity: 1;
    pointer-events: auto;
  }

  @keyframes email-recipient-chip-flash {
    0%,
    100% {
      filter: none;
    }
    50% {
      filter: brightness(0.85);
    }
  }

  &[data-flashing='true'] {
    animation: email-recipient-chip-flash 300ms ease-in-out 2;
  }
`;

type EmailRecipientChipProps = {
  recipient: EmailRecipient;
  resolution: EmailRecipientResolution | undefined;
  title: string;
  chipId?: string;
  isInvalid?: boolean;
  isSelected?: boolean;
  isFlashing?: boolean;
  onDoubleClick?: () => void;
  onRemove?: (event: MouseEvent) => void;
  removeAriaLabel: string;
};

export const EmailRecipientChip = ({
  recipient,
  resolution,
  title,
  chipId,
  isInvalid = false,
  isSelected = false,
  isFlashing = false,
  onDoubleClick,
  onRemove,
  removeAriaLabel,
}: EmailRecipientChipProps) => {
  const workspaceMember = resolution?.workspaceMember;
  const person = resolution?.person;

  const workspaceMemberFullName = isDefined(workspaceMember)
    ? `${workspaceMember.name.firstName} ${workspaceMember.name.lastName}`.trim()
    : '';
  const personFullName = isDefined(person)
    ? `${person.firstName} ${person.lastName}`.trim()
    : '';

  const label = getEmailIdentityDisplayName({
    personName: personFullName,
    workspaceMemberName: workspaceMemberFullName,
    displayName: recipient.displayName,
    handle: recipient.address,
  });

  return (
    <StyledContainer
      id={chipId}
      title={title}
      data-selected={isSelected}
      data-invalid={isInvalid}
      data-flashing={isFlashing}
      onDoubleClick={onDoubleClick}
    >
      <Chip
        variant="soft"
        maxWidth={CHIP_MAX_WIDTH}
        startElement={
          (isDefined(workspaceMember) || isDefined(person)) && (
            <Avatar
              src={getAbsoluteImageUrl(
                workspaceMember?.avatarUrl ?? person?.avatarUrl,
              )}
              name={label}
              colorSeed={workspaceMember?.id ?? person?.id}
              size="sm"
              shape="circle"
            />
          )
        }
      >
        {label}
      </Chip>
      {isDefined(onRemove) && (
        <StyledRemove>
          <LightIconButton
            size="xs"
            aria-label={removeAriaLabel}
            onClick={onRemove}
          >
            <IconX />
          </LightIconButton>
        </StyledRemove>
      )}
    </StyledContainer>
  );
};
