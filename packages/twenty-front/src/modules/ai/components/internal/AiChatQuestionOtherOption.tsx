import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { type KeyboardEvent, useContext, useRef } from 'react';
import { type IconComponent } from 'twenty-ui/icon';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

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
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  height: 32px;
`;

const StyledLabel = styled.span`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.md};
  line-height: 1.4;
`;

const StyledTextArea = styled.textarea`
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.sm};
  box-sizing: border-box;
  color: ${themeCssVariables.font.color.primary};
  font-family: inherit;
  font-size: ${themeCssVariables.font.size.md};
  line-height: 1.4;
  min-height: 24px;
  outline: none;
  padding: ${themeCssVariables.spacing[1]} ${themeCssVariables.spacing[2]};
  resize: none;
  width: 100%;

  &:focus {
    border-color: ${themeCssVariables.border.color.blue};
  }

  &::placeholder {
    color: ${themeCssVariables.font.color.light};
    font-weight: ${themeCssVariables.font.weight.medium};
  }
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
  const { theme } = useContext(ThemeContext);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const selectAndFocus = () => {
    onSelect();
    textareaRef.current?.focus();
  };

  return (
    <StyledContainer
      isHighlighted={isHighlighted}
      role="button"
      tabIndex={0}
      onClick={selectAndFocus}
      onKeyDown={(event) => {
        if (event.target !== event.currentTarget) {
          return;
        }

        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          selectAndFocus();
        }
      }}
    >
      <StyledLabelRow>
        <NumberIcon
          size={theme.icon.size.sm}
          color={themeCssVariables.font.color.tertiary}
        />
        <StyledLabel>{t`Other`}</StyledLabel>
      </StyledLabelRow>
      <StyledTextArea
        ref={textareaRef}
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
      />
    </StyledContainer>
  );
};
