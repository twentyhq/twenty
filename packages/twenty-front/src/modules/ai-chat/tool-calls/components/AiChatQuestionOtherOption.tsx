import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { type KeyboardEvent, useId, useRef } from 'react';
import { type IconComponent } from 'twenty-ui/icon';
import { Textarea } from 'twenty-ui/primitives/input';
import { useTheme, themeCssVariables } from 'twenty-ui/theme';

import { usePushFocusItemToFocusStack } from '@/ui/utilities/focus/hooks/usePushFocusItemToFocusStack';
import { useRemoveFocusItemFromFocusStackById } from '@/ui/utilities/focus/hooks/useRemoveFocusItemFromFocusStackById';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';

const StyledContainer = styled.div<{ isHighlighted: boolean }>`
  background: ${({ isHighlighted }) =>
    isHighlighted
      ? themeCssVariables.background.transparent.light
      : 'transparent'};
  border-radius: ${themeCssVariables.border.radius.sm};
  box-sizing: border-box;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  padding: 0 ${themeCssVariables.spacing[1]} ${themeCssVariables.spacing[1]};

  &:hover {
    background: ${themeCssVariables.background.transparent.light};
  }
`;

const StyledLabelRow = styled.div`
  align-items: center;
  border-radius: ${themeCssVariables.border.radius.sm};
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  height: 32px;

  &:focus-visible {
    outline: 2px solid ${themeCssVariables.color.blue};
    outline-offset: -2px;
  }
`;

const StyledLabel = styled.span`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.md};
  line-height: 1.4;
`;

type AiChatQuestionOtherOptionProps = {
  NumberIcon: IconComponent;
  isHighlighted: boolean;
  value: string;
  onChange: (value: string) => void;
  onSelect: () => void;
  onTextareaKeyDown: (event: KeyboardEvent<HTMLTextAreaElement>) => void;
};

export const AiChatQuestionOtherOption = ({
  NumberIcon,
  isHighlighted,
  value,
  onChange,
  onSelect,
  onTextareaKeyDown,
}: AiChatQuestionOtherOptionProps) => {
  const { t } = useLingui();
  const theme = useTheme();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const textAreaFocusId = useId();

  const { pushFocusItemToFocusStack } = usePushFocusItemToFocusStack();
  const { removeFocusItemFromFocusStackById } =
    useRemoveFocusItemFromFocusStackById();

  const selectAndFocus = () => {
    onSelect();
    textareaRef.current?.focus();
  };

  const handleTextareaFocus = () => {
    pushFocusItemToFocusStack({
      focusId: textAreaFocusId,
      component: {
        type: FocusComponentType.TEXT_AREA,
        instanceId: textAreaFocusId,
      },
      globalHotkeysConfig: {
        enableGlobalHotkeysConflictingWithKeyboard: false,
      },
    });
  };

  const handleTextareaBlur = () => {
    removeFocusItemFromFocusStackById({ focusId: textAreaFocusId });
  };

  return (
    <StyledContainer isHighlighted={isHighlighted} onClick={selectAndFocus}>
      <StyledLabelRow
        role="button"
        tabIndex={0}
        aria-pressed={isHighlighted}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            selectAndFocus();
          }
        }}
      >
        <NumberIcon
          size={theme.icon.size.sm}
          color={themeCssVariables.font.color.tertiary}
        />
        <StyledLabel>{t`Other`}</StyledLabel>
      </StyledLabelRow>
      <Textarea
        ref={textareaRef}
        size="sm"
        autoResize
        value={value}
        placeholder={t`Type your own answer here`}
        rows={1}
        onClick={(event) => {
          event.stopPropagation();
          if (!isHighlighted) {
            onSelect();
          }
        }}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={onTextareaKeyDown}
        onFocus={handleTextareaFocus}
        onBlur={handleTextareaBlur}
      />
    </StyledContainer>
  );
};
