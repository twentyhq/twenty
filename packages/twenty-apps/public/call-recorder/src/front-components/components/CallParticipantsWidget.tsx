import 'twenty-ui/style.css';

import styled from '@emotion/styled';
import { isUndefined } from '@sniptt/guards';
import {
  useSelectedObjectMetadata,
  useSelectedRecordIds,
  useTranslate,
} from 'twenty-sdk/front-component';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { CallParticipantChip } from 'src/front-components/components/CallParticipantChip';
import { FrontComponentThemeProvider } from 'src/front-components/components/FrontComponentThemeProvider';
import { StyledWidgetContainer } from 'src/front-components/components/StyledWidgetContainer';
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

const CallParticipantList = ({ callRecordingId }: CallParticipantListProps) => {
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

export const CallParticipantsWidget = () => {
  const selectedRecordIds = useSelectedRecordIds();
  const selectedObjectMetadata = useSelectedObjectMetadata();

  const callRecordingId =
    selectedRecordIds.length === 1 ? selectedRecordIds[0] : undefined;

  const renderContent = () => {
    if (
      selectedObjectMetadata?.nameSingular !== 'callRecording' ||
      isUndefined(callRecordingId)
    ) {
      return null;
    }

    return <CallParticipantList callRecordingId={callRecordingId} />;
  };

  return (
    <FrontComponentThemeProvider>
      <StyledWidgetContainer>{renderContent()}</StyledWidgetContainer>
    </FrontComponentThemeProvider>
  );
};
