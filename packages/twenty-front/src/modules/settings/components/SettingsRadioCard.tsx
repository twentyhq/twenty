import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { CardContent, IconComponent, Radio } from 'twenty-ui';

const StyledRadioCardContent = styled(CardContent)`
  display: flex;
  align-items: center;
  padding: ${({ theme }) => theme.spacing(2)};
  border: 1px solid ${({ theme }) => theme.border.color.light};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  flex-grow: 1;
  gap: ${({ theme }) => theme.spacing(2)};
  cursor: pointer;

  &:hover {
    background: ${({ theme }) => theme.background.transparent.lighter};
  }
`;

const StyledRadio = styled(Radio)`
  margin-left: auto;
  padding: ${({ theme }) => theme.spacing(1)};
`;

const StyledTitle = styled.div`
  color: ${({ theme }) => theme.font.color.secondary};
  font-weight: ${({ theme }) => theme.font.weight.medium};
`;

const StyledDescription = styled.div`
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.sm};
`;

type SettingsRadioCardProps = {
  value: string;
  handleClick: (value: string) => void;
  isSelected: boolean;
  title: string;
  description?: string;
  Icon?: IconComponent;
};

export const SettingsRadioCard = ({
  value,
  handleClick,
  title,
  description,
  isSelected,
  Icon,
}: SettingsRadioCardProps) => {
  const theme = useTheme();

  return (
    <StyledRadioCardContent onClick={() => handleClick(value)}>
      {Icon && <Icon size={theme.icon.size.xl} color={theme.color.gray50} />}
      <span>
        {title && <StyledTitle>{title}</StyledTitle>}
        {description && <StyledDescription>{description}</StyledDescription>}
      </span>
      <StyledRadio value={value} checked={isSelected} />
    </StyledRadioCardContent>
  );
};
