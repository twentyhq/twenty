import { useLingui } from '@lingui/react/macro';
import { styled } from '@linaria/react';
import { isDefined } from 'twenty-shared/utils';
import { IconCheck, IconZzz } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledActions = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[1]};
`;

const StyledCount = styled.span`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.md};
  margin-right: ${themeCssVariables.spacing[2]};
`;

type AiChatInboxBulkActionsProps = {
  selectedCount: number;
  onDone?: () => void;
  onSnooze?: () => void;
  onClearSelection?: () => void;
  onMarkAllDone?: () => void;
  disabled?: boolean;
};

export const AiChatInboxBulkActions = ({
  selectedCount,
  onDone,
  onSnooze,
  onClearSelection,
  onMarkAllDone,
  disabled = false,
}: AiChatInboxBulkActionsProps) => {
  const { t } = useLingui();

  if (selectedCount === 0) {
    return isDefined(onMarkAllDone) ? (
      <Button
        size="sm"
        variant="outline"
        startIcon={<IconCheck />}
        disabled={disabled}
        onClick={onMarkAllDone}
      >
        {t`Mark all done`}
      </Button>
    ) : null;
  }

  return (
    <StyledActions role="group" aria-label={t`Selected chats`}>
      <StyledCount>{t`${selectedCount} selected`}</StyledCount>
      {isDefined(onSnooze) && (
        <Button
          size="sm"
          variant="outline"
          startIcon={<IconZzz />}
          disabled={disabled}
          onClick={onSnooze}
        >
          {t`Snooze`}
        </Button>
      )}
      {isDefined(onDone) && (
        <Button
          size="sm"
          variant="outline"
          startIcon={<IconCheck />}
          disabled={disabled}
          onClick={onDone}
        >
          {t`Done`}
        </Button>
      )}
      {isDefined(onClearSelection) && (
        <Button
          size="sm"
          variant="ghost"
          disabled={disabled}
          onClick={onClearSelection}
        >
          {t`Clear selection`}
        </Button>
      )}
    </StyledActions>
  );
};
