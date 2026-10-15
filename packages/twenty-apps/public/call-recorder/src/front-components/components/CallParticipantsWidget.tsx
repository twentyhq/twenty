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
import { WidgetEmptyState } from 'src/front-components/components/WidgetEmptyState';
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
      return null;
    case 'error':
      return (
        <WidgetEmptyState
          title="Could Not Load Participants"
          description="Something went wrong while loading this call's participants."
        />
      );
    case 'notLinkedToMeeting':
      return (
        <WidgetEmptyState
          title="No Meeting"
          description="This recording is not linked to a calendar event."
        />
      );
    case 'loaded': {
      const { items } = buildCallParticipantDisplayItems({
        participants: callParticipantsState.participants,
        areRelationsLoaded: callParticipantsState.areRelationsLoaded,
        showUnmatchedAttendees: isShowUnmatchedAttendeesEnabled(),
      });

      if (items.length === 0) {
        return (
          <WidgetEmptyState
            title="No Participants"
            description="No attendees of this call match a person or member of your workspace."
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
      return (
        <WidgetEmptyState
          title="Not Available Here"
          description="Add this widget to a call recording page."
        />
      );
    }

    if (isUndefined(callRecordingId)) {
      return <WidgetEmptyState title="No Call Recording Selected" />;
    }

    return <CallParticipantList callRecordingId={callRecordingId} />;
  };

  return (
    <FrontComponentThemeProvider>
      <StyledWidgetContainer>{renderContent()}</StyledWidgetContainer>
    </FrontComponentThemeProvider>
  );
};
