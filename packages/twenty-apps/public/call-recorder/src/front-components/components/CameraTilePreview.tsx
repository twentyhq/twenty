import styled from '@emotion/styled';
import { isNonEmptyString } from '@sniptt/guards';
import { getPublicAssetUrl, isDefined } from 'twenty-sdk/utils';
import { themeCssVariables } from 'twenty-ui/theme';

import {
  CAMERA_TILE_TWENTY_BACKGROUND_ASSET_PATH,
  CAMERA_TILE_WORKSPACE_BACKGROUND_ASSET_PATH,
} from 'src/logic-functions/constants/camera-tile-asset-paths';
import {
  CAMERA_TILE_BACKGROUND_COLOR,
  CAMERA_TILE_INITIAL_COLOR,
  CAMERA_TILE_INITIAL_FONT_SIZE,
  CAMERA_TILE_LOGO_BOX_SIZE,
  CAMERA_TILE_MINIMAL_FONT_SIZE,
  CAMERA_TILE_PLATE_COLOR,
  CAMERA_TILE_PLATE_RADIUS,
  CAMERA_TILE_PLATE_SIZE,
  CAMERA_TILE_PLATE_STROKE_COLOR,
  CAMERA_TILE_PLATE_TOP,
  CAMERA_TILE_RECORDING_BOTTOM_INSET,
  CAMERA_TILE_RECORDING_DOT_COLOR,
  CAMERA_TILE_RECORDING_DOT_GAP,
  CAMERA_TILE_RECORDING_DOT_SIZE,
  CAMERA_TILE_RECORDING_FONT_SIZE,
  CAMERA_TILE_RECORDING_LABEL,
  CAMERA_TILE_SECONDARY_TEXT_OPACITY,
  CAMERA_TILE_SUBTITLE_FONT_SIZE,
  CAMERA_TILE_SUBTITLE_LINE_HEIGHT,
  CAMERA_TILE_TEXT_LINE_GAP,
  CAMERA_TILE_TEXT_MAX_WIDTH,
  CAMERA_TILE_TEXT_TOP,
  CAMERA_TILE_TEXT_COLOR,
  CAMERA_TILE_TITLE_FONT_SIZE,
  CAMERA_TILE_TITLE_LINE_HEIGHT,
  CAMERA_TILE_TWENTY_SUBTITLE,
  CAMERA_TILE_TWENTY_TITLE,
} from 'src/logic-functions/constants/camera-tile-config';
import { RECALL_BOT_IMAGE_WIDTH } from 'src/logic-functions/constants/recall-bot-image-config';
import { type CallRecorderStyle } from 'src/logic-functions/types/call-recorder-style.type';
import { canRenderWithCameraTileFont } from 'src/logic-functions/utils/can-render-with-camera-tile-font.util';

// Meeting apps draw their own placeholder when the bot sends no image.
const MEETING_PLACEHOLDER_BACKGROUND_COLOR = '#25272b';
const MEETING_PLACEHOLDER_AVATAR_COLOR = '#5b5f66';

// Sizes come from the server layout in 1280px frame pixels and scale with the preview width.
const toTileUnits = (pixels: number) =>
  `${((pixels / RECALL_BOT_IMAGE_WIDTH) * 100).toFixed(3)}cqw`;

const SCRIM_GRADIENT = `radial-gradient(closest-side, ${CAMERA_TILE_BACKGROUND_COLOR}f0 45%, ${CAMERA_TILE_BACKGROUND_COLOR}00 100%)`;

const StyledTile = styled.div<{ $backgroundColor: string }>`
  aspect-ratio: 16 / 9;
  background-color: ${({ $backgroundColor }) => $backgroundColor};
  color: ${CAMERA_TILE_TEXT_COLOR};
  container-type: inline-size;
  font-family: ${() => themeCssVariables.font.family};
  font-weight: ${() => themeCssVariables.font.weight.semiBold};
  overflow: hidden;
  position: relative;
  width: 100%;
`;

const StyledBackground = styled.img`
  height: 100%;
  inset: 0;
  object-fit: cover;
  position: absolute;
  width: 100%;
`;

const StyledPlate = styled.div`
  align-items: center;
  background-color: ${CAMERA_TILE_PLATE_COLOR};
  border: ${toTileUnits(2)} solid ${CAMERA_TILE_PLATE_STROKE_COLOR};
  border-radius: ${toTileUnits(CAMERA_TILE_PLATE_RADIUS)};
  box-shadow: 0 ${toTileUnits(16)} ${toTileUnits(52)} rgba(0, 0, 0, 0.55);
  box-sizing: border-box;
  color: ${CAMERA_TILE_INITIAL_COLOR};
  display: flex;
  font-size: ${toTileUnits(CAMERA_TILE_INITIAL_FONT_SIZE)};
  height: ${toTileUnits(CAMERA_TILE_PLATE_SIZE)};
  justify-content: center;
  left: 50%;
  position: absolute;
  top: ${toTileUnits(CAMERA_TILE_PLATE_TOP)};
  transform: translateX(-50%);
  width: ${toTileUnits(CAMERA_TILE_PLATE_SIZE)};
`;

const StyledLogo = styled.img`
  max-height: ${toTileUnits(CAMERA_TILE_LOGO_BOX_SIZE)};
  max-width: ${toTileUnits(CAMERA_TILE_LOGO_BOX_SIZE)};
  object-fit: contain;
`;

const StyledTextBlock = styled.div<{ $top: number }>`
  align-items: center;
  background: ${SCRIM_GRADIENT};
  display: flex;
  flex-direction: column;
  gap: ${toTileUnits(CAMERA_TILE_TEXT_LINE_GAP)};
  left: 50%;
  max-width: ${toTileUnits(CAMERA_TILE_TEXT_MAX_WIDTH)};
  padding: ${toTileUnits(50)} ${toTileUnits(160)};
  position: absolute;
  top: calc(${({ $top }) => toTileUnits($top)} - ${toTileUnits(50)});
  transform: translateX(-50%);
`;

const StyledTitle = styled.span`
  font-size: ${toTileUnits(CAMERA_TILE_TITLE_FONT_SIZE)};
  line-height: ${toTileUnits(CAMERA_TILE_TITLE_LINE_HEIGHT)};
  white-space: nowrap;
`;

const StyledSubtitle = styled.span`
  font-size: ${toTileUnits(CAMERA_TILE_SUBTITLE_FONT_SIZE)};
  line-height: ${toTileUnits(CAMERA_TILE_SUBTITLE_LINE_HEIGHT)};
  opacity: ${CAMERA_TILE_SECONDARY_TEXT_OPACITY};
  white-space: nowrap;
`;

const StyledMinimalWord = styled.span`
  font-size: ${toTileUnits(CAMERA_TILE_MINIMAL_FONT_SIZE)};
  left: 50%;
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
`;

const StyledRecordingLabel = styled.div`
  align-items: center;
  background: ${SCRIM_GRADIENT};
  bottom: calc(
    ${toTileUnits(CAMERA_TILE_RECORDING_BOTTOM_INSET)} - ${toTileUnits(30)}
  );
  display: flex;
  font-size: ${toTileUnits(CAMERA_TILE_RECORDING_FONT_SIZE)};
  gap: ${toTileUnits(CAMERA_TILE_RECORDING_DOT_GAP)};
  left: 50%;
  padding: ${toTileUnits(30)} ${toTileUnits(80)};
  position: absolute;
  transform: translateX(-50%);
`;

const StyledRecordingDot = styled.span`
  background-color: ${CAMERA_TILE_RECORDING_DOT_COLOR};
  border-radius: 50%;
  corner-shape: round;
  height: ${toTileUnits(CAMERA_TILE_RECORDING_DOT_SIZE)};
  width: ${toTileUnits(CAMERA_TILE_RECORDING_DOT_SIZE)};
`;

const StyledRecordingText = styled.span`
  opacity: ${CAMERA_TILE_SECONDARY_TEXT_OPACITY};
`;

const StyledPlaceholderAvatar = styled.div`
  align-items: center;
  background-color: ${MEETING_PLACEHOLDER_AVATAR_COLOR};
  border-radius: 50%;
  corner-shape: round;
  display: flex;
  font-size: ${toTileUnits(96)};
  font-weight: ${() => themeCssVariables.font.weight.medium};
  height: ${toTileUnits(240)};
  justify-content: center;
  left: 50%;
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  width: ${toTileUnits(240)};
`;

const StyledRecorderName = styled.span`
  bottom: ${toTileUnits(20)};
  font-size: ${toTileUnits(30)};
  font-weight: ${() => themeCssVariables.font.weight.medium};
  left: ${toTileUnits(28)};
  max-width: 60%;
  overflow: hidden;
  position: absolute;
  text-overflow: ellipsis;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.6);
  white-space: nowrap;
`;

const getFirstCharacter = (text: string) =>
  Array.from(text)[0]?.toLocaleUpperCase() ?? '';

type CameraTileTextBlockProps = {
  title: string | undefined;
  subtitle?: string;
};

const CameraTileTextBlock = ({ title, subtitle }: CameraTileTextBlockProps) => {
  if (!isDefined(title) && !isDefined(subtitle)) {
    return null;
  }

  return (
    <StyledTextBlock $top={CAMERA_TILE_TEXT_TOP}>
      {isDefined(title) && <StyledTitle>{title}</StyledTitle>}
      {isDefined(subtitle) && <StyledSubtitle>{subtitle}</StyledSubtitle>}
    </StyledTextBlock>
  );
};

export type CameraTilePreviewProps = {
  style: CallRecorderStyle;
  logoUrl: string | undefined;
  displayName: string | undefined;
  isRecording?: boolean;
  recorderName?: string;
};

export const CameraTilePreview = ({
  style,
  logoUrl,
  displayName,
  isRecording = false,
  recorderName,
}: CameraTilePreviewProps) => {
  const renderableDisplayName =
    isDefined(displayName) && canRenderWithCameraTileFont(displayName)
      ? displayName
      : undefined;
  const hasWorkspaceBranding =
    isDefined(logoUrl) || isDefined(renderableDisplayName);
  const recorderNameLabel = isNonEmptyString(recorderName) && (
    <StyledRecorderName>{recorderName}</StyledRecorderName>
  );

  if (style === 'NONE') {
    return (
      <StyledTile $backgroundColor={MEETING_PLACEHOLDER_BACKGROUND_COLOR}>
        <StyledPlaceholderAvatar>
          {getFirstCharacter(
            isNonEmptyString(recorderName)
              ? recorderName
              : CAMERA_TILE_TWENTY_TITLE,
          )}
        </StyledPlaceholderAvatar>
        {recorderNameLabel}
      </StyledTile>
    );
  }

  const recordingLabel = isRecording && (
    <StyledRecordingLabel>
      <StyledRecordingDot />
      <StyledRecordingText>{CAMERA_TILE_RECORDING_LABEL}</StyledRecordingText>
    </StyledRecordingLabel>
  );

  if (style === 'MINIMAL') {
    return (
      <StyledTile $backgroundColor={CAMERA_TILE_BACKGROUND_COLOR}>
        <StyledMinimalWord>{CAMERA_TILE_TWENTY_TITLE}</StyledMinimalWord>
        {recordingLabel}
        {recorderNameLabel}
      </StyledTile>
    );
  }

  if (style === 'WORKSPACE' && hasWorkspaceBranding) {
    return (
      <StyledTile $backgroundColor={CAMERA_TILE_BACKGROUND_COLOR}>
        <StyledBackground
          src={getPublicAssetUrl(CAMERA_TILE_WORKSPACE_BACKGROUND_ASSET_PATH)}
          alt=""
        />
        <CameraTileTextBlock title={renderableDisplayName} />
        <StyledPlate>
          {isDefined(logoUrl) ? (
            <StyledLogo src={logoUrl} alt="" />
          ) : (
            getFirstCharacter(renderableDisplayName ?? '')
          )}
        </StyledPlate>
        {recordingLabel}
        {recorderNameLabel}
      </StyledTile>
    );
  }

  return (
    <StyledTile $backgroundColor={CAMERA_TILE_BACKGROUND_COLOR}>
      <StyledBackground
        src={getPublicAssetUrl(CAMERA_TILE_TWENTY_BACKGROUND_ASSET_PATH)}
        alt=""
      />
      <CameraTileTextBlock
        title={CAMERA_TILE_TWENTY_TITLE}
        subtitle={CAMERA_TILE_TWENTY_SUBTITLE}
      />
      {recordingLabel}
      {recorderNameLabel}
    </StyledTile>
  );
};
