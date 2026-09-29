import { TIMELINE_ICON_SLOT_SIZE } from '@/activities/timeline-activities/constants/TimelineIconSlotSize';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { IconButton } from 'twenty-ui/components';
import { IconChevronDown, IconChevronUp } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme';

type EventCardToggleButtonProps = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
};

const StyledButtonContainer = styled.div`
  align-items: center;
  border-radius: ${themeCssVariables.border.radius.sm};
  display: flex;
  flex-shrink: 0;
  height: ${TIMELINE_ICON_SLOT_SIZE}px;
`;

export const EventCardToggleButton = ({
  isOpen,
  setIsOpen,
}: EventCardToggleButtonProps) => {
  const { t } = useLingui();

  return (
    <StyledButtonContainer>
      <IconButton
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? t`Collapse details` : t`Expand details`}
        size="sm"
        variant="outline"
      >
        {isOpen ? <IconChevronUp /> : <IconChevronDown />}
      </IconButton>
    </StyledButtonContainer>
  );
};
