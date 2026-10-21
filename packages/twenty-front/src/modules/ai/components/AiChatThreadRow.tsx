import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { type MouseEvent, type ReactNode } from 'react';
import { Key } from 'ts-key-enum';
import { isDefined } from 'twenty-shared/utils';
import { Checkbox } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledRow = styled.div<{ $isSelected: boolean; $isChecked: boolean }>`
  align-items: flex-start;
  background: ${({ $isSelected, $isChecked }) =>
    $isChecked
      ? themeCssVariables.accent.tertiary
      : $isSelected
        ? themeCssVariables.background.transparent.light
        : 'transparent'};
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  container-type: inline-size;
  cursor: pointer;
  display: flex;
  gap: ${themeCssVariables.spacing[4]};
  padding: ${themeCssVariables.spacing[4]};
  position: relative;

  &:hover {
    background: ${({ $isChecked }) =>
      $isChecked
        ? themeCssVariables.accent.tertiary
        : themeCssVariables.background.transparent.lighter};
  }

  &:focus-visible {
    outline: 2px solid ${themeCssVariables.accent.primary};
    outline-offset: -2px;
  }
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

const StyledBody = styled.div`
  display: grid;
  flex: 1;
  gap: ${themeCssVariables.spacing[2]} 0;
  grid-template-columns: minmax(0, 1fr);
  min-width: 0;

  @media (hover: hover) {
    grid-template-columns: minmax(0, 1fr) auto;
  }

  @container (max-width: 480px) {
    grid-template-columns: minmax(0, 1fr);
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

const StyledTime = styled.div`
  flex-shrink: 0;
  white-space: nowrap;
`;

const StyledActions = styled.div<{ $isOpen: boolean }>`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[1]};
  grid-column: 1;

  @media (hover: hover) {
    display: ${({ $isOpen }) => ($isOpen ? 'flex' : 'none')};
    grid-column: 2;
    grid-row: 1;
    margin-left: ${themeCssVariables.spacing[4]};
    margin-top: ${themeCssVariables.spacing[1]};

    ${StyledRow}:hover &,
    ${StyledRow}:focus-within & {
      display: flex;
    }
  }

  @container (max-width: 480px) {
    grid-column: 1;
    grid-row: auto;
    margin-left: 0;
    margin-top: 0;
  }
`;

const StyledContent = styled.div<{
  $areActionsOpen: boolean;
  $hasActions: boolean;
}>`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing['0.5']};
  min-width: 0;

  @media (hover: hover) {
    ${StyledTime} {
      display: ${({ $areActionsOpen, $hasActions }) =>
        $areActionsOpen && $hasActions ? 'none' : 'block'};
    }

    ${StyledRow}:hover & ${StyledTime},
    ${StyledRow}:focus-within & ${StyledTime} {
      display: ${({ $hasActions }) => ($hasActions ? 'none' : 'block')};
    }
  }

  @container (max-width: 480px) {
    ${StyledTime},
    ${StyledRow}:hover & ${StyledTime},
    ${StyledRow}:focus-within & ${StyledTime} {
      display: block;
    }
  }
`;

const StyledInlineActions = styled.div`
  grid-column: 1 / -1;
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
  areActionsOpen?: boolean;
  onClick: (event: MouseEvent<HTMLDivElement>) => void;
  onCheckboxClick?: (event: MouseEvent<HTMLDivElement>) => void;
  onContextMenu?: (event: MouseEvent<HTMLDivElement>) => void;
};

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
  areActionsOpen = false,
  onClick,
  onCheckboxClick,
  onContextMenu,
}: AiChatThreadRowProps) => {
  const { t } = useLingui();

  return (
    <StyledRow
      $isSelected={isSelected}
      $isChecked={isChecked}
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
    >
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
      <StyledBody>
        <StyledContent
          $areActionsOpen={areActionsOpen}
          $hasActions={isDefined(actions)}
        >
          <StyledHeading>
            <StyledTitle>{title}</StyledTitle>
            <StyledTime>{activityTime}</StyledTime>
          </StyledHeading>
          {subtitle}
        </StyledContent>
        {isDefined(children) && (
          <StyledInlineActions
            data-select-disable
            onClick={(event) => event.stopPropagation()}
            onContextMenu={(event) => event.stopPropagation()}
          >
            {children}
          </StyledInlineActions>
        )}
        {isDefined(actions) && (
          <StyledActions
            $isOpen={areActionsOpen}
            data-select-disable
            onClick={(event) => event.stopPropagation()}
            onContextMenu={(event) => event.stopPropagation()}
          >
            {actions}
          </StyledActions>
        )}
      </StyledBody>
    </StyledRow>
  );
};
