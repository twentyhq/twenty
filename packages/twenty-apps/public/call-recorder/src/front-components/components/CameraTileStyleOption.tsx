import styled from '@emotion/styled';
import { useId } from 'react';
import { getPublicAssetUrl } from 'twenty-sdk/utils';
import { IconCheck } from 'twenty-ui/icon';
import { Radio } from 'twenty-ui/primitives/input';
import { THEME_COMMON, themeCssVariables } from 'twenty-ui/theme';

import { CAMERA_TILE_PREVIEW_ASSET_PATHS } from 'src/front-components/constants/camera-tile-preview-asset-paths.constant';
import { type CallRecorderStyle } from 'src/logic-functions/types/call-recorder-style.type';

const StyledChoice = styled.label`
  display: flex;
  flex-direction: column;
  min-width: 0;
`;

const StyledTile = styled.div`
  border-radius: ${() => themeCssVariables.border.radius.md};
  cursor: pointer;
  display: block;
  overflow: hidden;
  position: relative;
  width: 100%;

  &::after {
    border-radius: inherit;
    box-shadow: inset 0 0 0 1px ${() => themeCssVariables.border.color.medium};
    content: '';
    inset: 0;
    pointer-events: none;
    position: absolute;
  }

  &:focus-visible {
    outline: 2px solid ${() => themeCssVariables.color.blue};
    outline-offset: 1px;
  }
`;

const StyledCheckmark = styled.div`
  align-items: center;
  background-color: ${() => themeCssVariables.color.blue};
  border-radius: ${() => themeCssVariables.border.radius.rounded};
  bottom: ${() => themeCssVariables.spacing[2]};
  color: ${() => themeCssVariables.grayScale.gray1};
  corner-shape: round;
  display: flex;
  height: ${() => themeCssVariables.spacing[5]};
  inset-inline-end: ${() => themeCssVariables.spacing[2]};
  justify-content: center;
  opacity: 0;
  position: absolute;
  transition:
    opacity 0.3s ease-in-out,
    visibility 0s linear 0.3s;
  visibility: hidden;
  width: ${() => themeCssVariables.spacing[5]};
  z-index: 1;

  &[data-checked] {
    opacity: 1;
    transition:
      opacity 0.3s ease-in-out,
      visibility 0s;
    visibility: visible;
  }

  @media (prefers-reduced-motion: reduce) {
    &,
    &[data-checked] {
      transition: none;
    }
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

type CameraTileStyleOptionProps = {
  style: CallRecorderStyle;
  label: string;
};

export const CameraTileStyleOption = ({
  style,
  label,
}: CameraTileStyleOptionProps) => {
  const labelId = useId();

  return (
    <StyledChoice>
      <Radio.Root
        value={style}
        aria-labelledby={labelId}
        render={<StyledTile />}
      >
        <StyledPreviewImage
          src={getPublicAssetUrl(CAMERA_TILE_PREVIEW_ASSET_PATHS[style])}
          alt=""
        />
        <Radio.Indicator keepMounted aria-hidden render={<StyledCheckmark />}>
          <IconCheck size={THEME_COMMON.icon.size.sm} />
        </Radio.Indicator>
      </Radio.Root>
      <StyledChoiceLabel id={labelId}>{label}</StyledChoiceLabel>
    </StyledChoice>
  );
};
