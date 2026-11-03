import styled from '@emotion/styled';
import { useRef, type KeyboardEvent } from 'react';
import { IconCheck } from 'twenty-ui/icon';
import { THEME_COMMON, themeCssVariables } from 'twenty-ui/theme';

import { CALL_RECORDER_STYLE_OPTIONS } from 'src/constants/call-recorder-style-options';
import {
  CameraTilePreview,
  type CameraTilePreviewProps,
} from 'src/front-components/components/CameraTilePreview';
import { type CallRecorderStyle } from 'src/logic-functions/types/call-recorder-style.type';

const MOBILE_CHOICE_WIDTH = '160px';
const NAVIGATION_STEP_BY_KEY: Record<string, number> = {
  ArrowRight: 1,
  ArrowDown: 1,
  ArrowLeft: -1,
  ArrowUp: -1,
};

const StyledChoices = styled.div`
  display: flex;
  gap: ${() => themeCssVariables.spacing[4]};
  width: 100%;

  @media (max-width: 767px) {
    overflow-x: auto;
  }
`;

const StyledChoice = styled.div`
  display: flex;
  flex: 1 1 0;
  flex-direction: column;
  min-width: 0;

  @media (max-width: 767px) {
    flex: 0 0 ${MOBILE_CHOICE_WIDTH};
  }
`;

const StyledTileButton = styled.button`
  background: none;
  border: none;
  border-radius: ${() => themeCssVariables.border.radius.md};
  cursor: pointer;
  display: block;
  overflow: hidden;
  padding: 0;
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

const StyledChoiceLabel = styled.span`
  color: ${() => themeCssVariables.font.color.secondary};
  font-size: ${() => themeCssVariables.font.size.xs};
  font-weight: ${() => themeCssVariables.font.weight.medium};
  margin-top: ${() => themeCssVariables.spacing[2]};
`;

type CameraTileStylePickerProps = Omit<CameraTilePreviewProps, 'style'> & {
  idPrefix: string;
  label: string;
  value: CallRecorderStyle;
  onChange: (style: CallRecorderStyle) => void;
};

export const getCameraTileStyleOptionId = (
  idPrefix: string,
  style: CallRecorderStyle,
) => `${idPrefix}-${style.toLowerCase()}`;

export const CameraTileStylePicker = ({
  idPrefix,
  label,
  value,
  onChange,
  ...previewProps
}: CameraTileStylePickerProps) => {
  const optionReferences = useRef<
    Partial<Record<CallRecorderStyle, HTMLButtonElement | null>>
  >({});

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    const step = NAVIGATION_STEP_BY_KEY[event.key];

    if (step === undefined) {
      return;
    }

    event.preventDefault();

    const currentIndex = CALL_RECORDER_STYLE_OPTIONS.findIndex(
      (option) => option.value === value,
    );
    const nextStyle =
      CALL_RECORDER_STYLE_OPTIONS[
        (currentIndex + step + CALL_RECORDER_STYLE_OPTIONS.length) %
          CALL_RECORDER_STYLE_OPTIONS.length
      ].value;

    onChange(nextStyle);
    optionReferences.current[nextStyle]?.focus();
  };

  return (
    <StyledChoices role="radiogroup" aria-label={label}>
      {CALL_RECORDER_STYLE_OPTIONS.map((option) => {
        const isChecked = option.value === value;
        const optionId = getCameraTileStyleOptionId(idPrefix, option.value);
        const labelId = `${optionId}-label`;

        return (
          <StyledChoice key={option.value}>
            <StyledTileButton
              ref={(element) => {
                optionReferences.current[option.value] = element;
              }}
              id={optionId}
              type="button"
              role="radio"
              aria-checked={isChecked}
              aria-labelledby={labelId}
              tabIndex={isChecked ? 0 : -1}
              onClick={() => onChange(option.value)}
              onKeyDown={handleKeyDown}
            >
              <CameraTilePreview style={option.value} {...previewProps} />
              <StyledCheckmark $checked={isChecked} aria-hidden>
                <IconCheck size={THEME_COMMON.icon.size.sm} />
              </StyledCheckmark>
            </StyledTileButton>
            <StyledChoiceLabel id={labelId}>{option.label}</StyledChoiceLabel>
          </StyledChoice>
        );
      })}
    </StyledChoices>
  );
};
