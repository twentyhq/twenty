import styled from '@emotion/styled';
import { getPublicAssetUrl } from 'twenty-sdk/utils';
import { IconCheck } from 'twenty-ui/icon';
import { THEME_COMMON, themeCssVariables } from 'twenty-ui/theme';

import { CALL_RECORDER_STYLE_OPTIONS } from 'src/constants/call-recorder-style-options';
import { CAMERA_TILE_PREVIEW_ASSET_PATHS } from 'src/front-components/constants/camera-tile-preview-asset-paths.constant';
import { type CallRecorderStyle } from 'src/logic-functions/types/call-recorder-style.type';

const TWO_COLUMN_MAX_WIDTH = '560px';

const StyledChoices = styled.div`
  display: grid;
  gap: ${() => themeCssVariables.spacing[4]};
  grid-template-columns: repeat(4, minmax(0, 1fr));
  width: 100%;

  @media (max-width: ${TWO_COLUMN_MAX_WIDTH}) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`;

const StyledChoice = styled.label`
  cursor: pointer;
  display: flex;
  flex-direction: column;
  min-width: 0;
`;

const StyledRadioInput = styled.input`
  opacity: 0;
  pointer-events: none;
  position: absolute;
`;

const StyledTile = styled.span`
  border-radius: ${() => themeCssVariables.border.radius.md};
  display: block;
  overflow: hidden;
  position: relative;

  &::after {
    border-radius: inherit;
    box-shadow: inset 0 0 0 1px ${() => themeCssVariables.border.color.medium};
    content: '';
    inset: 0;
    pointer-events: none;
    position: absolute;
  }

  input:focus-visible + & {
    outline: 2px solid ${() => themeCssVariables.color.blue};
    outline-offset: 1px;
  }
`;

const StyledCheckmark = styled.span<{ $checked: boolean }>`
  align-items: center;
  background-color: ${() => themeCssVariables.color.blue};
  border-radius: 50%;
  corner-shape: round;
  bottom: ${() => themeCssVariables.spacing[2]};
  color: ${() => themeCssVariables.grayScale.gray1};
  display: flex;
  height: ${() => themeCssVariables.spacing[5]};
  justify-content: center;
  opacity: ${({ $checked }) => ($checked ? 1 : 0)};
  position: absolute;
  right: ${() => themeCssVariables.spacing[2]};
  transition: opacity 0.3s ease-in-out;
  width: ${() => themeCssVariables.spacing[5]};
  z-index: 1;

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

const StyledPreviewImage = styled.img`
  aspect-ratio: 16 / 9;
  display: block;
  object-fit: cover;
  width: 100%;
`;

const StyledChoiceLabel = styled.span`
  color: ${() => themeCssVariables.font.color.secondary};
  font-size: ${() => themeCssVariables.font.size.xs};
  font-weight: ${() => themeCssVariables.font.weight.medium};
  margin-top: ${() => themeCssVariables.spacing[2]};
`;

type CameraTileStylePickerProps = {
  id: string;
  label: string;
  value: CallRecorderStyle;
  onChange: (style: CallRecorderStyle) => void;
};

export const CameraTileStylePicker = ({
  id,
  label,
  value,
  onChange,
}: CameraTileStylePickerProps) => (
  <StyledChoices id={id} role="radiogroup" aria-label={label}>
    {CALL_RECORDER_STYLE_OPTIONS.map((option) => {
      const isChecked = option.value === value;

      return (
        <StyledChoice key={option.value}>
          <StyledRadioInput
            type="radio"
            name={id}
            value={option.value}
            checked={isChecked}
            onChange={() => onChange(option.value)}
          />
          <StyledTile>
            <StyledPreviewImage
              src={getPublicAssetUrl(
                CAMERA_TILE_PREVIEW_ASSET_PATHS[option.value],
              )}
              alt=""
            />
            <StyledCheckmark $checked={isChecked} aria-hidden>
              <IconCheck size={THEME_COMMON.icon.size.sm} />
            </StyledCheckmark>
          </StyledTile>
          <StyledChoiceLabel>{option.label}</StyledChoiceLabel>
        </StyledChoice>
      );
    })}
  </StyledChoices>
);
