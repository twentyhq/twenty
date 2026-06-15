import { styled } from '@linaria/react';
import { useContext, type ReactNode } from 'react';
import { type IconComponent, IconX } from 'twenty-ui/display';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';
import { isDefined } from 'twenty-shared/utils';

const StyledChip = styled.div<{ variant: SortOrFilterChipVariant }>`
  align-items: center;
  background-color: ${({ variant }) => {
    switch (variant) {
      case 'danger':
        return themeCssVariables.background.danger;
      case 'default':
      default:
        return themeCssVariables.accent.quaternary;
    }
  }};
  border: 1px solid
    ${({ variant }) => {
      switch (variant) {
        case 'danger':
          return themeCssVariables.border.color.danger;
        case 'default':
        default:
          return themeCssVariables.accent.tertiary;
      }
    }};
  border-radius: 4px;
  box-sizing: border-box;
  color: ${({ variant }) => {
    switch (variant) {
      case 'danger':
        return themeCssVariables.color.red;
      case 'default':
      default:
        return themeCssVariables.color.blue;
    }
  }};
  column-gap: ${themeCssVariables.spacing[1]};
  cursor: pointer;
  display: flex;
  flex-direction: row;
  flex-shrink: 0;
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.medium};
  height: 24px;
  padding: ${themeCssVariables.spacing[0.5]};
  padding-left: ${themeCssVariables.spacing[1]};
  user-select: none;
  white-space: nowrap;
`;

const StyledIcon = styled.div`
  align-items: center;
  display: flex;
`;

const StyledDelete = styled.button<{ variant: SortOrFilterChipVariant }>`
  align-items: center;
  background: none;
  border: none;
  box-sizing: border-box;
  color: inherit;
  cursor: pointer;
  display: flex;
  font-size: ${themeCssVariables.font.size.sm};
  height: 20px;
  justify-content: center;
  margin: 0;
  padding: 0;
  user-select: none;
  width: 20px;

  &:hover {
    background-color: ${({ variant }) => {
      switch (variant) {
        case 'danger':
          return themeCssVariables.color.red5;
        case 'default':
        default:
          return themeCssVariables.accent.secondary;
      }
    }};
    border-radius: ${themeCssVariables.border.radius.sm};
  }
`;

const StyledLabelKey = styled.div`
  font-weight: ${themeCssVariables.font.weight.medium};
`;

const StyledFilterValue = styled.span`
  font-weight: ${themeCssVariables.font.weight.regular};
`;

const StyledSortValue = styled.span`
  font-weight: ${themeCssVariables.font.weight.medium};
`;

const StyledSubFieldSeparator = styled.span`
  font-weight: ${themeCssVariables.font.weight.regular};
  opacity: 0.6;
  padding: 0 ${themeCssVariables.spacing[1]};
`;

const StyledSubFieldValue = styled.span`
  font-weight: ${themeCssVariables.font.weight.regular};
`;

const StyledKeyLabelContainer = styled.div`
  display: flex;
`;

export type SortOrFilterChipVariant = 'default' | 'danger';

export type SortOrFilterChipType = 'sort' | 'filter';

type SortOrFilterChipProps = {
  labelKey?: string;
  labelValue: string;
  labelSubField?: ReactNode;
  variant?: SortOrFilterChipVariant;
  Icon?: IconComponent;
  onRemove: () => void;
  onClick?: () => void;
  testId?: string;
  type: SortOrFilterChipType;
};

export const SortOrFilterChip = ({
  labelKey,
  labelValue,
  labelSubField,
  variant = 'default',
  Icon,
  onRemove,
  testId,
  onClick,
  type,
}: SortOrFilterChipProps) => {
  const { theme } = useContext(ThemeContext);

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
      <StyledKeyLabelContainer>
        {labelKey && <StyledLabelKey>{labelKey}</StyledLabelKey>}
        {type === 'sort' ? (
          <StyledSortValue>{labelValue}</StyledSortValue>
        ) : (
          <StyledFilterValue>{labelValue}</StyledFilterValue>
        )}
        {isDefined(labelSubField) && (
          <>
            <StyledSubFieldSeparator>·</StyledSubFieldSeparator>
            <StyledSubFieldValue>{labelSubField}</StyledSubFieldValue>
          </>
        )}
      </StyledKeyLabelContainer>
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
