import styled from '@emotion/styled';

import { useTheme } from '@mui/material';

const SequenceStepContainer = styled.div<{ type: 'email' | 'wait' | 'task' | 'sms' }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: ${({ theme }) => theme.background.secondary};
  border-radius: 8px;
  border-left: 3px solid
    ${({ type, theme }) => {
      switch (type) {
        case 'email':
          return theme.color.blue;
        case 'wait':
          return theme.color.orange;
        case 'task':
          return theme.color.purple;
        case 'sms':
          return theme.color.green;
        default:
          return theme.color.gray;
      }
    }};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.background.tertiary};
  }
`;

const StepIcon = styled.div<{ type: 'email' | 'wait' | 'task' | 'sms' }>`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ type, theme }) => {
    switch (type) {
      case 'email':
        return theme.color.blue + '20';
      case 'wait':
        return theme.color.orange + '20';
      case 'task':
        return theme.color.purple + '20';
      case 'sms':
        return theme.color.green + '20';
      default:
        return theme.color.gray + '20';
    }
  }};
  color: ${({ type, theme }) => {
    switch (type) {
      case 'email':
        return theme.color.blue;
      case 'wait':
        return theme.color.orange;
      case 'task':
        return theme.color.purple;
      case 'sms':
        return theme.color.green;
      default:
        return theme.color.gray;
    }
  }};
`;

const StepContent = styled.div`
  flex: 1;
`;

const StepTitle = styled.div`
  font-weight: 600;
  font-size: 14px;
  color: ${({ theme }) => theme.font.color.primary};
`;

const StepDescription = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.font.color.secondary};
  margin-top: 2px;
`;

interface SequenceStepCardProps {
  type: 'email' | 'wait' | 'task' | 'sms';
  title: string;
  description: string;
  onClick?: () => void;
}

const getIconForType = (type: string) => {
  switch (type) {
    case 'email':
      return '📧';
    case 'wait':
      return '⏱️';
    case 'task':
      return '✅';
    case 'sms':
      return '💬';
    default:
      return '📋';
  }
};

export const SequenceStepCard = ({
  type,
  title,
  description,
  onClick,
}: SequenceStepCardProps) => {
  return (
    <SequenceStepContainer type={type} onClick={onClick}>
      <StepIcon type={type}>{getIconForType(type)}</StepIcon>
      <StepContent>
        <StepTitle>{title}</StepTitle>
        <StepDescription>{description}</StepDescription>
      </StepContent>
    </SequenceStepContainer>
  );
};
