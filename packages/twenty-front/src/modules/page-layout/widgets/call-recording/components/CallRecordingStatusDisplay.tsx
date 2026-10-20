import { CallRecordingWidgetEmptyStateDisplay } from '@/page-layout/widgets/call-recording/components/CallRecordingWidgetEmptyStateDisplay';
import { type WidgetCallRecordingCandidate } from '@/page-layout/widgets/call-recording/types/WidgetCallRecordingCandidate';
import {
  type CallRecordingArtifactType,
  getCallRecordingStatusDisplayConfiguration,
} from '@/page-layout/widgets/call-recording/utils/getCallRecordingStatusDisplayConfiguration';
import { EmptyState } from '@/ui/feedback/empty-state/components/EmptyState';
import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledCompactStatus = styled.div`
  padding: ${themeCssVariables.spacing[6]} 0;
`;

type CallRecordingStatusDisplayProps = {
  callRecording: Pick<WidgetCallRecordingCandidate, 'status' | 'transcript'>;
  artifactType: CallRecordingArtifactType;
  isCompact?: boolean;
};

export const CallRecordingStatusDisplay = ({
  callRecording,
  artifactType,
  isCompact = false,
}: CallRecordingStatusDisplayProps) => {
  const { title, subTitle } = getCallRecordingStatusDisplayConfiguration(
    callRecording,
    artifactType,
  );

  if (isCompact) {
    return (
      <StyledCompactStatus>
        <EmptyState.Content>
          <EmptyState.Title>{title}</EmptyState.Title>
          <EmptyState.Description>{subTitle}</EmptyState.Description>
        </EmptyState.Content>
      </StyledCompactStatus>
    );
  }

  return (
    <CallRecordingWidgetEmptyStateDisplay
      animatedPlaceholderType="noCallRecording"
      title={title}
      subTitle={subTitle}
    />
  );
};
