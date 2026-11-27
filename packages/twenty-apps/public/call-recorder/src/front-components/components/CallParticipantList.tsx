import styled from '@emotion/styled';
import { useTranslate } from 'twenty-sdk/front-component';
import { themeCssVariables } from 'twenty-ui/theme';

import { CallParticipantChip } from 'src/front-components/components/CallParticipantChip';
import { StyledChipSkeleton } from 'src/front-components/components/StyledChipSkeleton';
import { useCallParticipants } from 'src/front-components/hooks/use-call-participants';
import { buildCallParticipantDisplayItems } from 'src/front-components/utils/build-call-participant-display-items.util';

const StyledChipList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${() => themeCssVariables.spacing[1]};
`;

type CallParticipantListProps = {
  callRecordingId: string;
};

export const CallParticipantList = ({
  callRecordingId,
}: CallParticipantListProps) => {
  const { t } = useTranslate();
  const callParticipantsState = useCallParticipants(callRecordingId);

  if (callParticipantsState.status === 'loading') {
    return (
      <StyledChipSkeleton
        aria-busy
        aria-label={t('Loading call participants')}
        $width={themeCssVariables.spacing[24]}
      />
    );
  }

  if (callParticipantsState.status === 'error') {
    return null;
  }

  const { items } = buildCallParticipantDisplayItems({
    participants: callParticipantsState.participants,
    areRelationsLoaded: callParticipantsState.areRelationsLoaded,
  });

  if (items.length === 0) {
    return null;
  }

  return (
    <StyledChipList>
      {items.map((item) => (
        <CallParticipantChip key={item.key} participant={item} />
      ))}
    </StyledChipList>
  );
};
