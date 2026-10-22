import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { type MouseEvent, type ReactNode } from 'react';
import { Key } from 'ts-key-enum';
import { isDefined } from 'twenty-shared/utils';
import { Checkbox } from 'twenty-ui/primitives/input';
import { ListItem } from 'twenty-ui/primitives/navigation';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledRow = styled.div`
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  border-radius: 0;
  column-gap: ${themeCssVariables.spacing[4]};
  padding: ${themeCssVariables.spacing[4]};
  row-gap: ${themeCssVariables.spacing[2]};
`;

const StyledLeading = styled.div`
  align-items: center;
  display: flex;
  flex-shrink: 0;
  height: ${themeCssVariables.spacing[8]};
  justify-content: center;
  width: ${themeCssVariables.spacing[6]};
`;

const StyledCheckbox = styled.div<{ $isChecked: boolean }>`
  display: ${({ $isChecked }) => ($isChecked ? 'flex' : 'none')};

  ${StyledRow}:focus-within & {
    display: flex;
  }

  @media (hover: hover) {
    ${StyledRow}:hover & {
      display: flex;
    }
  }
`;

const StyledAvatar = styled.div<{ $isCheckable: boolean; $isChecked: boolean }>`
  display: ${({ $isChecked }) => ($isChecked ? 'none' : 'flex')};

  ${StyledRow}:focus-within & {
    display: ${({ $isCheckable, $isChecked }) =>
      $isCheckable || $isChecked ? 'none' : 'flex'};
  }

  @media (hover: hover) {
    ${StyledRow}:hover & {
      display: ${({ $isCheckable, $isChecked }) =>
        $isCheckable || $isChecked ? 'none' : 'flex'};
    }
  }
`;

const StyledHeading = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  min-width: 0;
`;

const StyledTitle = styled.div`
  display: flex;
  flex: 1;
  min-width: 0;
`;

const StyledTime = styled.div<{
  $isActionMenuOpen: boolean;
  $hasActions: boolean;
}>`
  flex-shrink: 0;
  white-space: nowrap;

  @media (hover: hover) {
    display: ${({ $isActionMenuOpen, $hasActions }) =>
      $isActionMenuOpen && $hasActions ? 'none' : 'block'};

    ${StyledRow}:hover &,
    ${StyledRow}:focus-within & {
      display: ${({ $hasActions }) => ($hasActions ? 'none' : 'block')};
    }
  }

  @container (max-width: 480px) {
    &,
    ${StyledRow}:hover &,
    ${StyledRow}:focus-within & {
      display: block;
    }
  }
`;

const StyledActions = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[1]};
  margin-top: ${themeCssVariables.spacing[1]};

  @container (max-width: 480px) {
    margin-top: 0;
    padding-left: calc(
      ${themeCssVariables.spacing[6]} + ${themeCssVariables.spacing[4]}
    );
  }
`;

const StyledDescription = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  min-width: 0;
`;

type AiChatThreadRowProps = {
  id: string;
  label: string;
  avatar: ReactNode;
  title: ReactNode;
  subtitle: ReactNode;
  activityTime?: ReactNode;
  actions?: ReactNode;
  children?: ReactNode;
  isSelected?: boolean;
  isChecked?: boolean;
  isEditing?: boolean;
  isActionMenuOpen?: boolean;
  onClick: (event: MouseEvent<HTMLDivElement>) => void;
  onCheckboxClick?: (event: MouseEvent<HTMLDivElement>) => void;
  onContextMenu?: (event: MouseEvent<HTMLDivElement>) => void;
};

const stopPropagation = (event: MouseEvent<HTMLDivElement>) =>
  event.stopPropagation();

export const AiChatThreadRow = ({
  id,
  label,
  avatar,
  title,
  subtitle,
  activityTime,
  actions,
  children,
  isSelected = false,
  isChecked = false,
  isEditing = false,
  isActionMenuOpen = false,
  onClick,
  onCheckboxClick,
  onContextMenu,
}: AiChatThreadRowProps) => {
  const { t } = useLingui();

  return (
    <ListItem
      active={isSelected}
      selected={isChecked}
      selectionAppearance="accent"
      descriptionPlacement="below"
      actionsVisibility={isActionMenuOpen ? 'always' : 'hover'}
      render={
        <StyledRow
          aria-label={label}
          role="group"
          tabIndex={0}
          data-selectable-id={id}
          data-select-disable={isEditing || undefined}
          onMouseDown={(event) => {
            if (event.shiftKey && !isEditing) {
              event.preventDefault();
            }
          }}
          onKeyDown={(event) => {
            if (
              event.target !== event.currentTarget ||
              isEditing ||
              (event.key !== Key.Enter && event.key !== ' ')
            ) {
              return;
            }

            event.preventDefault();
            event.stopPropagation();
            event.currentTarget.click();
          }}
          onClick={isEditing ? undefined : onClick}
          onContextMenu={isEditing ? undefined : onContextMenu}
        />
      }
      startIcon={
        <StyledLeading
          data-select-disable={isDefined(onCheckboxClick) || undefined}
          onClick={
            isDefined(onCheckboxClick)
              ? (event) => {
                  event.stopPropagation();
                  onCheckboxClick(event);
                }
              : undefined
          }
        >
          {isDefined(onCheckboxClick) && (
            <StyledCheckbox $isChecked={isChecked}>
              <Checkbox checked={isChecked} aria-label={t`Select chat`} />
            </StyledCheckbox>
          )}
          <StyledAvatar
            $isCheckable={isDefined(onCheckboxClick)}
            $isChecked={isChecked}
          >
            {avatar}
          </StyledAvatar>
        </StyledLeading>
      }
      description={
        <StyledDescription>
          {subtitle}
          {isDefined(children) && (
            <div
              data-select-disable
              onClick={stopPropagation}
              onContextMenu={stopPropagation}
            >
              {children}
            </div>
          )}
        </StyledDescription>
      }
      actions={
        isDefined(actions) && (
          <StyledActions
            data-select-disable
            onClick={stopPropagation}
            onContextMenu={stopPropagation}
          >
            {actions}
          </StyledActions>
        )
      }
    >
      <StyledHeading>
        <StyledTitle>{title}</StyledTitle>
        <StyledTime
          $isActionMenuOpen={isActionMenuOpen}
          $hasActions={isDefined(actions)}
        >
          {activityTime}
        </StyledTime>
      </StyledHeading>
    </ListItem>
  );
};
