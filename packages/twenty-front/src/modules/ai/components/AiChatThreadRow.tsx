import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { type MouseEvent, type ReactNode } from 'react';
import { Key } from 'ts-key-enum';
import { isDefined } from 'twenty-shared/utils';
import { ThinkingOrbitLoaderIcon } from 'twenty-ui/icon';
import { Checkbox } from 'twenty-ui/primitives/input';
import { ListItem } from 'twenty-ui/primitives/navigation';
import { themeCssVariables } from 'twenty-ui/theme';

import { AiChatThreadRowContent } from '@/ai/components/AiChatThreadRowContent';
import { type AiChatThreadListVariant } from '@/ai/types/AiChatThreadListVariant';

const StyledRow = styled.div<{ $isCompact: boolean }>`
  border-bottom: ${({ $isCompact }) =>
    $isCompact ? 'none' : `1px solid ${themeCssVariables.border.color.light}`};
  border-radius: ${({ $isCompact }) =>
    $isCompact ? themeCssVariables.border.radius.sm : '0'};
  column-gap: ${({ $isCompact }) =>
    $isCompact ? themeCssVariables.spacing[2] : themeCssVariables.spacing[4]};
  height: ${({ $isCompact }) =>
    $isCompact ? themeCssVariables.spacing[8] : 'auto'};
  padding: ${({ $isCompact }) =>
    $isCompact
      ? `0 ${themeCssVariables.spacing[1]}`
      : themeCssVariables.spacing[4]};
  row-gap: ${themeCssVariables.spacing[2]};
`;

const StyledLeading = styled.div<{ $isCompact: boolean }>`
  align-items: center;
  display: flex;
  flex-shrink: 0;
  height: ${themeCssVariables.spacing[8]};
  justify-content: ${({ $isCompact }) =>
    $isCompact ? 'flex-start' : 'center'};
  width: ${({ $isCompact }) =>
    $isCompact ? themeCssVariables.spacing[7] : themeCssVariables.spacing[6]};
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

const StyledTime = styled.div<{
  $isActionMenuOpen: boolean;
  $hasActions: boolean;
}>`
  align-items: center;
  display: flex;
  flex-shrink: 0;
  gap: ${themeCssVariables.spacing[1]};
  white-space: nowrap;

  @media (hover: hover) and (not (any-pointer: coarse)) {
    display: ${({ $isActionMenuOpen, $hasActions }) =>
      $isActionMenuOpen && $hasActions ? 'none' : 'flex'};

    ${StyledRow}:hover &,
    ${StyledRow}:focus-within & {
      display: ${({ $hasActions }) => ($hasActions ? 'none' : 'flex')};
    }
  }
`;

const StyledActions = styled.div<{
  $isCompact: boolean;
  $isActionMenuOpen: boolean;
}>`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
  height: ${themeCssVariables.spacing[8]};

  @media (hover: hover) and (not (any-pointer: coarse)) {
    display: ${({ $isCompact, $isActionMenuOpen }) =>
      $isCompact && !$isActionMenuOpen ? 'none' : 'flex'};

    ${StyledRow}:hover &,
    ${StyledRow}:focus-within & {
      display: flex;
    }
  }
`;

const StyledCompactTrailing = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
  height: ${themeCssVariables.spacing[8]};
`;

const StyledStreamingIcon = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;

  @media (prefers-reduced-motion: reduce) {
    display: none;
  }
`;

const StyledDescription = styled.div`
  line-height: calc(
    ${themeCssVariables.spacing[4]} - ${themeCssVariables.spacing[0.5]}
  );
  min-width: 0;
  overflow: hidden;
`;

const StyledRequestActions = styled.div`
  margin-top: ${themeCssVariables.spacing[2]};
`;

type AiChatThreadRowProps = {
  variant?: AiChatThreadListVariant;
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
  isStreaming?: boolean;
  onClick: (event: MouseEvent<HTMLDivElement>) => void;
  onCheckboxClick?: (event: MouseEvent<HTMLDivElement>) => void;
  onContextMenu?: (event: MouseEvent<HTMLDivElement>) => void;
};

const stopPropagation = (event: MouseEvent<HTMLDivElement>) =>
  event.stopPropagation();

export const AiChatThreadRow = ({
  variant = 'default',
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
  isStreaming = false,
  onClick,
  onCheckboxClick,
  onContextMenu,
}: AiChatThreadRowProps) => {
  const { t } = useLingui();
  const isCompact = variant === 'compact';
  const time = (
    <StyledTime
      $isActionMenuOpen={isActionMenuOpen}
      $hasActions={isDefined(actions)}
    >
      {isCompact && isStreaming && (
        <StyledStreamingIcon>
          <ThinkingOrbitLoaderIcon />
        </StyledStreamingIcon>
      )}
      {activityTime}
    </StyledTime>
  );
  const actionButtons = isDefined(actions) && (
    <StyledActions
      $isCompact={isCompact}
      $isActionMenuOpen={isActionMenuOpen}
      data-select-disable
      onClick={stopPropagation}
      onContextMenu={stopPropagation}
    >
      {actions}
    </StyledActions>
  );
  let rowActions = actionButtons;

  if (isCompact) {
    rowActions = (
      <StyledCompactTrailing>
        {time}
        {actionButtons}
      </StyledCompactTrailing>
    );
  }

  return (
    <ListItem
      active={isSelected}
      selected={isChecked}
      selectionAppearance="accent"
      descriptionPlacement={isCompact ? 'inline' : 'below'}
      actionsPlacement="end"
      actionsVisibility={isCompact || isActionMenuOpen ? 'always' : 'hover'}
      render={
        <StyledRow
          $isCompact={isCompact}
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
          $isCompact={isCompact}
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
        !isCompact && (
          <>
            <StyledDescription>{subtitle}</StyledDescription>
            {isDefined(children) && (
              <StyledRequestActions
                data-select-disable
                onClick={stopPropagation}
                onContextMenu={stopPropagation}
              >
                {children}
              </StyledRequestActions>
            )}
          </>
        )
      }
      actions={rowActions}
    >
      <AiChatThreadRowContent
        variant={variant}
        title={title}
        subtitle={subtitle}
        activityTime={time}
        isStreaming={isStreaming}
      />
    </ListItem>
  );
};
