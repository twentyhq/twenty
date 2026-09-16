import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { IconCheck, IconClockHour8, IconX } from 'twenty-ui/icon';
import { Tag } from 'twenty-ui/primitives/data-display';
import { Button, LightIconButton } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { InboxSnoozeDropdown } from '@/inbox/components/InboxSnoozeDropdown';
import { useInboxItemPlanContext } from '@/inbox/hooks/useInboxItemPlanContext';
import { getInboxToolCallRenderer } from '@/inbox/tool-call-renderers/utils/getInboxToolCallRenderer';
import { getInboxItemOutcomeLabel } from '@/inbox/utils/getInboxItemOutcomeLabel';
import { InboxItemToolCallStatus } from '~/generated/graphql';

const StyledFooter = styled.div`
  align-items: center;
  border-top: 1px solid ${themeCssVariables.border.color.light};
  display: flex;
  flex-shrink: 0;
  gap: ${themeCssVariables.spacing[2]};
  justify-content: flex-end;
  padding: ${themeCssVariables.spacing[3]} ${themeCssVariables.spacing[4]};
`;

// Pinned under the body whatever the item is about. Two operations exist,
// run the featured call and run the plan; the labels come from the featured
// call's tool and the counts from the plan, never from a layout.
export const InboxItemFooter = () => {
  const { t } = useLingui();
  const {
    inboxItem,
    isDone,
    isBusy,
    featuredToolCall,
    pendingToolCallCount,
    otherPendingToolCallCount,
    runAll,
    runToolCall,
    dismissItem,
    reopenItem,
  } = useInboxItemPlanContext();

  if (isDone) {
    return (
      <StyledFooter>
        {isDefined(inboxItem.outcome) && (
          <Tag color="gray">{getInboxItemOutcomeLabel(inboxItem.outcome)}</Tag>
        )}
        <Button onClick={reopenItem} size="sm" variant="outline">
          {t`Move to inbox`}
        </Button>
      </StyledFooter>
    );
  }

  const featuredRenderer = isDefined(featuredToolCall)
    ? getInboxToolCallRenderer(featuredToolCall.toolName)
    : undefined;
  // A retry runs its own row only: the plan run leaves failed rows alone.
  const isRetry = featuredToolCall?.status === InboxItemToolCallStatus.FAILED;
  const canRunRest = otherPendingToolCallCount > 0 && !isRetry;

  const featuredLabel = isRetry
    ? t`Try again`
    : (featuredRenderer?.runLabel() ?? t`Do this step`);
  const RunIcon = featuredRenderer?.RunIcon ?? IconCheck;

  const planLabel =
    pendingToolCallCount === 1
      ? t`Do 1 action`
      : pendingToolCallCount > 1
        ? t`Do ${pendingToolCallCount} actions`
        : inboxItem.toolCalls.length > 0
          ? t`Close plan`
          : t`Mark done`;

  return (
    <StyledFooter>
      <LightIconButton
        Icon={IconX}
        accent="secondary"
        aria-label={t`Dismiss`}
        title={t`Dismiss`}
        onClick={dismissItem}
      />
      <InboxSnoozeDropdown
        inboxItem={inboxItem}
        clickableComponent={
          <LightIconButton
            Icon={IconClockHour8}
            accent="secondary"
            aria-label={t`Snooze`}
            title={t`Snooze`}
          />
        }
      />
      {isDefined(featuredToolCall) ? (
        <>
          {canRunRest && (
            <Button
              size="sm"
              variant="outline"
              disabled={isBusy}
              onClick={() => void runToolCall(featuredToolCall.id)}
            >
              {featuredLabel}
            </Button>
          )}
          <Button
            startIcon={<RunIcon />}
            color="accent"
            size="sm"
            variant="solid"
            disabled={isBusy}
            onClick={() =>
              void (canRunRest ? runAll() : runToolCall(featuredToolCall.id))
            }
          >
            {canRunRest
              ? t`${featuredLabel} and do ${otherPendingToolCallCount} more`
              : featuredLabel}
          </Button>
        </>
      ) : (
        <Button
          startIcon={<IconCheck />}
          color="accent"
          size="sm"
          variant="solid"
          disabled={isBusy}
          onClick={() => void runAll()}
        >
          {planLabel}
        </Button>
      )}
    </StyledFooter>
  );
};
