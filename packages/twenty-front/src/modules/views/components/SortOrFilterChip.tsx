import { useLingui } from '@lingui/react/macro';
import { styled } from '@linaria/react';
import { useContext, type MouseEvent, type ReactNode } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { type IconComponent, IconX } from 'twenty-ui/icon';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

import { Dropdown, type DropdownProps } from '@/ui/layout/dropdown/components/Dropdown';

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
  border-radius: ${themeCssVariables.border.radius.smRound};
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
  corner-shape: round;
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

const StyledChipLabelButton = styled.button`
  align-items: center;
  background: none;
  border: none;
  color: inherit;
  column-gap: ${themeCssVariables.spacing[1]};
  cursor: pointer;
  display: flex;
  font: inherit;
  margin: 0;
  padding: 0;
`;

const StyledChipLabelStatic = styled.span`
  align-items: center;
  color: inherit;
  column-gap: ${themeCssVariables.spacing[1]};
  display: flex;
`;

const StyledChipLabelDropdownTrigger = styled.span`
  align-items: center;
  color: inherit;
  column-gap: ${themeCssVariables.spacing[1]};
  cursor: pointer;
  display: flex;
`;

const StyledIcon = styled.span`
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

const StyledLabelKey = styled.span`
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

const StyledKeyLabelContainer = styled.span`
  display: flex;
`;

export type SortOrFilterChipVariant = 'default' | 'danger';

export type SortOrFilterChipType = 'sort' | 'filter';

type SortOrFilterChipDropdownProps = Omit<DropdownProps, 'clickableComponent'>;

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
  // Wraps only the chip label so the remove button stays outside the
  // Dropdown trigger and avoids nested interactive controls (WCAG 4.1.2).
  dropdown?: SortOrFilterChipDropdownProps;
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
  dropdown,
}: SortOrFilterChipProps) => {
  const { theme } = useContext(ThemeContext);
  const { t } = useLingui();

  const handleDeleteClick = (event: MouseEvent) => {
    event.stopPropagation();
    onRemove();
  };

  const labelContent = (
    <>
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
    </>
  );

  const renderLabel = () => {
    if (isDefined(dropdown)) {
      return (
        <Dropdown
          {...dropdown}
          clickableComponent={
            <StyledChipLabelDropdownTrigger>
              {labelContent}
            </StyledChipLabelDropdownTrigger>
          }
        />
      );
    }

    if (isDefined(onClick)) {
      return (
        <StyledChipLabelButton type="button" onClick={onClick}>
          {labelContent}
        </StyledChipLabelButton>
      );
    }

    return <StyledChipLabelStatic>{labelContent}</StyledChipLabelStatic>;
  };

  return (
    <StyledChip variant={variant}>
      {renderLabel()}
      <StyledDelete
        type="button"
        variant={variant}
        onClick={handleDeleteClick}
        aria-label={type === 'sort' ? t`Remove sort` : t`Remove filter`}
        data-testid={'remove-icon-' + testId}
      >
        <IconX size={theme.icon.size.sm} stroke={theme.icon.stroke.sm} />
      </StyledDelete>
    </StyledChip>
  );
};
