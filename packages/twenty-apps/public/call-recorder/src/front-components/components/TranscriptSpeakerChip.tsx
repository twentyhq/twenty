// Duplicates minimal twenty-ui Chip logic for this app.
// Remove once twenty-ui can be imported safely in front components.
import styled from '@emotion/styled';

import { TranscriptSpeakerAvatar } from 'src/front-components/components/TranscriptSpeakerAvatar';
import { recordingThemeCssVariables } from 'src/front-components/constants/recording-theme-css-variables';

const StyledSpeakerChip = styled.span`
  align-items: center;
  border-radius: ${recordingThemeCssVariables.border.radiusSm};
  color: ${recordingThemeCssVariables.font.colorPrimary};
  display: inline-flex;
  font-size: ${recordingThemeCssVariables.font.sizeSm};
  font-weight: ${recordingThemeCssVariables.font.weightMedium};
  gap: ${recordingThemeCssVariables.spacing[1]};
  line-height: 1.4;
  max-width: 100%;
  min-width: 0;
  text-decoration: none;
  white-space: nowrap;
`;

const StyledSpeakerName = styled.span`
  flex-shrink: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
`;

type TranscriptSpeakerChipProps = {
  speakerName: string;
  avatarUrl: string | undefined;
  placeholderColorSeed: string;
};

export const TranscriptSpeakerChip = ({
  speakerName,
  avatarUrl,
  placeholderColorSeed,
}: TranscriptSpeakerChipProps) => {
  return (
    <StyledSpeakerChip>
      <TranscriptSpeakerAvatar
        speakerName={speakerName}
        avatarUrl={avatarUrl}
        placeholderColorSeed={placeholderColorSeed}
      />
      <StyledSpeakerName>{speakerName}</StyledSpeakerName>
    </StyledSpeakerChip>
  );
};
