import { TitleInput } from '@/ui/input/components/TitleInput';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useState } from 'react';
import { IconComponent } from 'twenty-ui';

const StyledHeader = styled.div`
  background-color: ${({ theme }) => theme.background.secondary};
  border-bottom: 1px solid ${({ theme }) => theme.border.color.medium};
  display: flex;
  flex-direction: row;
  padding: ${({ theme }) => theme.spacing(4)};
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledHeaderInfo = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledHeaderTitle = styled.div`
  color: ${({ theme }) => theme.font.color.primary};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  font-size: ${({ theme }) => theme.font.size.xl};
  width: fit-content;
  max-width: 420px;
  & > input:disabled {
    color: ${({ theme }) => theme.font.color.primary};
  }
`;

const StyledHeaderType = styled.div`
  color: ${({ theme }) => theme.font.color.tertiary};
  padding-left: ${({ theme }) => theme.spacing(1)};
`;

const StyledHeaderIconContainer = styled.div`
  align-self: flex-start;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: ${({ theme }) => theme.background.transparent.light};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  padding: ${({ theme }) => theme.spacing(2)};
`;

type WorkflowStepHeaderProps = {
  Icon: IconComponent;
  iconColor: string;
  initialTitle: string;
  headerType: string;
} & (
  | {
      disabled: true;
      onTitleChange?: never;
    }
  | {
      disabled?: boolean;
      onTitleChange: (newTitle: string) => void;
    }
);

export const WorkflowStepHeader = ({
  Icon,
  iconColor,
  initialTitle,
  headerType,
  disabled,
  onTitleChange,
}: WorkflowStepHeaderProps) => {
  const theme = useTheme();

  const [title, setTitle] = useState(initialTitle);

  const handleChange = (newTitle: string) => {
    setTitle(newTitle);
  };

  const handleEnter = () => {
    onTitleChange?.(title);
  };

  const handleEscape = () => {
    onTitleChange?.(title);
  };

  const handleClickOutside = () => {
    onTitleChange?.(title);
  };

  const handleTab = () => {
    onTitleChange?.(title);
  };

  const handleShiftTab = () => {
    onTitleChange?.(title);
  };

  return (
    <StyledHeader>
      <StyledHeaderIconContainer>
        <Icon
          color={iconColor}
          stroke={theme.icon.stroke.sm}
          size={theme.icon.size.lg}
        />
      </StyledHeaderIconContainer>
      <StyledHeaderInfo>
        <StyledHeaderTitle>
          <TitleInput
            disabled={disabled}
            sizeVariant="md"
            draftValue={title}
            onChange={handleChange}
            placeholder={headerType}
            hotkeyScope="workflow-step-title"
            onEnter={handleEnter}
            onEscape={handleEscape}
            onClickOutside={handleClickOutside}
            onTab={handleTab}
            onShiftTab={handleShiftTab}
          />
        </StyledHeaderTitle>
        <StyledHeaderType>{headerType}</StyledHeaderType>
      </StyledHeaderInfo>
    </StyledHeader>
  );
};
