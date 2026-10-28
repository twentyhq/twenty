import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { type MouseEvent, type ReactNode } from 'react';
import { Key } from 'ts-key-enum';
import { isDefined } from 'twenty-shared/utils';
import { ThinkingOrbitLoaderIcon } from 'twenty-ui/icon';
import { Checkbox } from 'twenty-ui/primitives/input';
import { ListItem } from 'twenty-ui/primitives/navigation';
import { themeCssVariables } from 'twenty-ui/theme';

import { ShimmeringText } from '@/ai/components/ShimmeringText';

const StyledRow = styled.div`
  gap: ${themeCssVariables.spacing[2]};
  height: ${themeCssVariables.spacing[8]};
  padding: 0 ${themeCssVariables.spacing[1]};
`;

const StyledLeading = styled.div`
  align-items: center;
  display: flex;
  flex-shrink: 0;
  justify-content: flex-start;
  width: ${themeCssVariables.spacing[7]};
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

const StyledContent = styled.div`
  align-items: center;
  display: flex;
  font-size: ${themeCssVariables.font.size.md};
  gap: ${themeCssVariables.spacing[1]};
  min-width: 0;
`;

const StyledTitle = styled.div`
  flex: 0 1 auto;
  max-width: 60%;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledSeparator = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  flex-shrink: 0;
`;

const StyledPreview = styled.div`
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledStreamingPreview = styled.div`
  min-width: 0;
  overflow: hidden;

  @media (prefers-reduced-motion: reduce) {
    & * {
      animation: none;
    }

    > * {
      -webkit-text-fill-color: currentColor;
      background: none;
    }
  }
`;

const StyledTrailing = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
  height: ${themeCssVariables.spacing[8]};
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

const StyledStreamingIcon = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;

  @media (prefers-reduced-motion: reduce) {
    display: none;
  }
`;

const StyledActions = styled.div<{ $isActionMenuOpen: boolean }>`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[1]};

  @media (hover: hover) and (not (any-pointer: coarse)) {
    display: ${({ $isActionMenuOpen }) =>
      $isActionMenuOpen ? 'flex' : 'none'};

    ${StyledRow}:hover &,
    ${StyledRow}:focus-within & {
      display: flex;
    }
  }
`;

type AiChatThreadCompactRowProps = {
  id: string;
  label: string;
  avatar: ReactNode;
  title: ReactNode;
  subtitle: ReactNode;
  activityTime?: ReactNode;
  actions?: ReactNode;
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

export const AiChatThreadCompactRow = ({
  id,
  label,
  avatar,
  title,
  subtitle,
  activityTime,
  actions,
  isSelected = false,
  isChecked = false,
  isEditing = false,
  isActionMenuOpen = false,
  isStreaming = false,
  onClick,
  onCheckboxClick,
  onContextMenu,
}: AiChatThreadCompactRowProps) => {
  const { t } = useLingui();

  return (
    <ListItem
      active={isSelected}
      selected={isChecked}
      selectionAppearance="accent"
      actionsVisibility="always"
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
      actions={
        <StyledTrailing>
          <StyledTime
            $isActionMenuOpen={isActionMenuOpen}
            $hasActions={isDefined(actions)}
          >
            {isStreaming && (
              <StyledStreamingIcon>
                <ThinkingOrbitLoaderIcon />
              </StyledStreamingIcon>
            )}
            {activityTime}
          </StyledTime>
          {isDefined(actions) && (
            <StyledActions
              $isActionMenuOpen={isActionMenuOpen}
              data-select-disable
              onClick={stopPropagation}
              onContextMenu={stopPropagation}
            >
              {actions}
            </StyledActions>
          )}
        </StyledTrailing>
      }
    >
      <StyledContent>
        <StyledTitle>{title}</StyledTitle>
        {isDefined(subtitle) && (
          <>
            <StyledSeparator aria-hidden>·</StyledSeparator>
            <StyledPreview>
              {isStreaming ? (
                <StyledStreamingPreview>
                  <ShimmeringText>{subtitle}</ShimmeringText>
                </StyledStreamingPreview>
              ) : (
                subtitle
              )}
            </StyledPreview>
          </>
        )}
      </StyledContent>
    </ListItem>
  );
};
