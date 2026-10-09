import 'twenty-ui/style.css';

import styled from '@emotion/styled';
import { isUndefined } from '@sniptt/guards';
import {
  useSelectedObjectMetadata,
  useSelectedRecordIds,
} from 'twenty-sdk/front-component';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { CallParticipantChip } from 'src/front-components/components/CallParticipantChip';
import { FrontComponentThemeProvider } from 'src/front-components/components/FrontComponentThemeProvider';
import { StyledWidgetContainer } from 'src/front-components/components/StyledWidgetContainer';
import { WidgetMessage } from 'src/front-components/components/WidgetMessage';
import { useCallParticipants } from 'src/front-components/hooks/use-call-participants';
import { buildCallParticipantDisplayItems } from 'src/front-components/utils/build-call-participant-display-items.util';
import { isShowUnmatchedAttendeesEnabled } from 'src/front-components/utils/is-show-unmatched-attendees-enabled.util';

const StyledChipList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${() => themeCssVariables.spacing[1]};
`;

type CallParticipantListProps = {
  callRecordingId: string;
};

const CallParticipantList = ({ callRecordingId }: CallParticipantListProps) => {
  const callParticipantsState = useCallParticipants(callRecordingId);

  switch (callParticipantsState.status) {
    case 'loading':
      return <WidgetMessage message="Loading participants…" />;
    case 'error':
      return <WidgetMessage message="Could not load participants." />;
    case 'notLinkedToMeeting':
      return (
        <WidgetMessage message="This recording is not linked to a meeting." />
      );
    case 'loaded': {
      const { items, hiddenUnmatchedCount } = buildCallParticipantDisplayItems({
        participants: callParticipantsState.participants,
        areRelationsLoaded: callParticipantsState.areRelationsLoaded,
        showUnmatchedAttendees: isShowUnmatchedAttendeesEnabled(),
      });

      if (items.length === 0) {
        return (
          <WidgetMessage
            message={
              hiddenUnmatchedCount > 0
                ? 'No attendees match a person or member of your workspace.'
                : 'This meeting has no participants to show.'
            }
          />
        );
      }

      return (
        <StyledChipList>
          {items.map((item) => (
            <CallParticipantChip key={item.key} participant={item} />
          ))}
        </StyledChipList>
      );
    }
  }
};

export const CallParticipantsWidget = () => {
  const selectedRecordIds = useSelectedRecordIds();
  const selectedObjectMetadata = useSelectedObjectMetadata();

  const callRecordingId =
    selectedRecordIds.length === 1 ? selectedRecordIds[0] : undefined;

  const renderContent = () => {
    if (selectedObjectMetadata?.nameSingular !== 'callRecording') {
      return <WidgetMessage message="Not available on this page." />;
    }

    if (isUndefined(callRecordingId)) {
      return <WidgetMessage message="No call recording selected." />;
    }

    return <CallParticipantList callRecordingId={callRecordingId} />;
  };

  return (
    <FrontComponentThemeProvider>
      <StyledWidgetContainer>{renderContent()}</StyledWidgetContainer>
    </FrontComponentThemeProvider>
  );
};
