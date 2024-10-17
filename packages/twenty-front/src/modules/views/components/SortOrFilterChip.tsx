import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { IconComponent, IconX } from 'twenty-ui';

const StyledChip = styled.div<{ variant: SortOrFitlerChipVariant }>`
  align-items: center;
  background-color: ${({ theme, variant }) => {
    switch (variant) {
      case 'danger':
        return theme.background.danger;
      case 'default':
      default:
        return theme.accent.quaternary;
    }
  }};
  border: 1px solid
    ${({ theme, variant }) => {
      switch (variant) {
        case 'danger':
          return theme.border.color.danger;
        case 'default':
        default:
          return theme.accent.tertiary;
      }
    }};
  border-radius: 4px;
  color: ${({ theme, variant }) => {
    switch (variant) {
      case 'danger':
        return theme.color.red;
      case 'default':
      default:
        return theme.color.blue;
    }
  }};
  cursor: pointer;
  display: flex;
  flex-direction: row;
  flex-shrink: 0;
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  padding: ${({ theme }) => theme.spacing(0.5) + ' ' + theme.spacing(2)};
  margin-left: ${({ theme }) => theme.spacing(2)};
  user-select: none;
  white-space: nowrap;

  max-height: ${({ theme }) => theme.spacing(4.5)};
`;

const StyledIcon = styled.div`
  align-items: center;
  display: flex;
  margin-right: ${({ theme }) => theme.spacing(1)};
`;

const StyledDelete = styled.div<{ variant: SortOrFitlerChipVariant }>`
  align-items: center;
  cursor: pointer;
  padding: ${({ theme }) => theme.spacing(0.5)};
  display: flex;
  font-size: ${({ theme }) => theme.font.size.sm};
  margin-left: ${({ theme }) => theme.spacing(2)};
  margin-top: 1px;
  user-select: none;
  &:hover {
    background-color: ${({ theme, variant }) => {
      switch (variant) {
        case 'danger':
          return theme.color.red20;
        case 'default':
        default:
          return theme.accent.secondary;
      }
    }};
    border-radius: ${({ theme }) => theme.border.radius.sm};
  }
`;

const StyledLabelKey = styled.div`
  font-weight: ${({ theme }) => theme.font.weight.medium};
`;

type SortOrFitlerChipVariant = 'default' | 'danger';

type SortOrFilterChipProps = {
  labelKey?: string;
  labelValue: string;
  variant?: SortOrFitlerChipVariant;
  Icon?: IconComponent;
  onRemove: () => void;
  onClick?: () => void;
  testId?: string;
};

export const SortOrFilterChip = ({
  labelKey,
  labelValue,
  variant = 'default',
  Icon,
  onRemove,
  testId,
  onClick,
}: SortOrFilterChipProps) => {
  const theme = useTheme();

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRemove();
  };

  return (
    <StyledChip onClick={onClick} variant={variant}>
      {Icon && (
        <StyledIcon>
          <Icon size={theme.icon.size.sm} />
        </StyledIcon>
      )}
      {labelKey && <StyledLabelKey>{labelKey}</StyledLabelKey>}
      {labelValue}
      <StyledDelete
        variant={variant}
        onClick={handleDeleteClick}
        data-testid={'remove-icon-' + testId}
      >
        <IconX size={theme.icon.size.sm} stroke={theme.icon.stroke.sm} />
      </StyledDelete>
    </StyledChip>
  );
};
