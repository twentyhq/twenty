import 'twenty-ui/style.css';

import { isUndefined } from '@sniptt/guards';
import {
  useSelectedObjectMetadata,
  useSelectedRecordIds,
} from 'twenty-sdk/front-component';

import { CallParticipantList } from 'src/front-components/components/CallParticipantList';
import { FrontComponentThemeProvider } from 'src/front-components/components/FrontComponentThemeProvider';
import { StyledWidgetContainer } from 'src/front-components/components/StyledWidgetContainer';

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
