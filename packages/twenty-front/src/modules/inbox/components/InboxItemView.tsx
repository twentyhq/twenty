import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { useContext, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { Tag } from 'twenty-ui/data-display';
import { IconCheck, IconClockHour8, IconX, useIcons } from 'twenty-ui/icon';
import { Button, LightIconButton } from 'twenty-ui/input';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

import { InboxItemSubjectChip } from '@/inbox/components/InboxItemSubjectChip';
import { InboxListRowButtons } from '@/inbox/components/InboxListRowButtons';
import { InboxPlanActionsSummary } from '@/inbox/components/InboxPlanActionsSummary';
import { InboxPlanEntityGraph } from '@/inbox/components/InboxPlanEntityGraph';
import { InboxPlanToolCallRow } from '@/inbox/components/InboxPlanToolCallRow';
import { InboxSnoozeDropdown } from '@/inbox/components/InboxSnoozeDropdown';
import { useInboxItemActions } from '@/inbox/hooks/useInboxItemActions';
import { getInboxItemContext } from '@/inbox/utils/getInboxItemContext';
import { getInboxItemOutcomeLabel } from '@/inbox/utils/getInboxItemOutcomeLabel';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import {
  type InboxItem,
  InboxItemOutcome,
  InboxItemScope,
  InboxItemToolCallStatus,
} from '~/generated/graphql';
import { beautifyPastDateRelativeToNow } from '~/utils/date-utils';

const StyledView = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
`;

const StyledScroll = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[4]};
  min-height: 0;
  overflow-y: auto;
  padding: ${themeCssVariables.spacing[4]};
`;

const StyledHeader = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  font-size: ${themeCssVariables.font.size.xs};
  gap: ${themeCssVariables.spacing[1]};
  justify-content: space-between;
`;

const StyledType = styled.span`
  align-items: center;
  display: inline-flex;
  gap: ${themeCssVariables.spacing[1]};
`;

const StyledTitle = styled.h1`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.xl};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  margin: 0;
`;

const StyledSectionTitle = styled.div`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.medium};
`;

const StyledContextCard = styled.div`
  background: ${themeCssVariables.background.secondary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.md};
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
  padding: ${themeCssVariables.spacing[3]};
`;

const StyledSummary = styled.p`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.md};
  line-height: 1.5;
  margin: 0;
`;

const StyledToolCallRows = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
`;

const StyledFooter = styled.div`
  align-items: center;
  border-top: 1px solid ${themeCssVariables.border.color.light};
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing[3]} ${themeCssVariables.spacing[4]};
`;

const StyledFooterEnd = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  margin-left: auto;
`;

export const InboxItemView = ({ inboxItem }: { inboxItem: InboxItem }) => {
  const { t } = useLingui();
  const { theme } = useContext(ThemeContext);
  const { getIcon } = useIcons();
  const { enqueueErrorSnackBar } = useSnackBar();
  const {
    transitionInboxItem,
    reopenInboxItem,
    runInboxItemToolCalls,
    updateInboxItemToolCallInput,
    setInboxItemToolCallRejected,
  } = useInboxItemActions();

  const context = getInboxItemContext(inboxItem);
  const toolCalls = inboxItem.toolCalls;
  const pendingToolCalls = toolCalls.filter(
    (toolCall) => toolCall.status === InboxItemToolCallStatus.PROPOSED,
  );
  const isDone = inboxItem.scope === InboxItemScope.DONE;
  const InboxItemTypeIcon = getIcon(inboxItem.inboxItemType.icon);
  const hasContext =
    isNonEmptyString(context.summary) ||
    isDefined(context.source) ||
    isDefined(inboxItem.threadId) ||
    isDefined(inboxItem.subjectRecordId) ||
    context.entities.length > 0;

  // Every call starts folded; the person opens the ones they want to change.
  const [expandedToolCallIds, setExpandedToolCallIds] = useState<string[]>([]);

  const expandToolCall = (toolCallId: string) =>
    setExpandedToolCallIds((current) =>
      current.includes(toolCallId) ? current : [...current, toolCallId],
    );
  const toggleToolCall = (toolCallId: string) =>
    setExpandedToolCallIds((current) =>
      current.includes(toolCallId)
        ? current.filter((id) => id !== toolCallId)
        : [...current, toolCallId],
    );
  const [isRunning, setIsRunning] = useState(false);
  const [inFlightEditCount, setInFlightEditCount] = useState(0);
  const [failedSaveToolCallIds, setFailedSaveToolCallIds] = useState<string[]>(
    [],
  );

  const reportFailure = () =>
    enqueueErrorSnackBar({ message: t`That could not be applied` });

  // A blur save or a skip still on the wire must land before the item is done,
  // or the run could use the input from before the edit. A save that failed
  // keeps the run blocked until that call saves again, since its editor still
  // shows what the server never got.
  const trackEdit = async (
    edit: () => Promise<unknown>,
    { toolCallId, isInputSave }: { toolCallId: string; isInputSave: boolean },
  ) => {
    setInFlightEditCount((count) => count + 1);

    try {
      await edit();

      if (isInputSave) {
        setFailedSaveToolCallIds((current) =>
          current.filter((id) => id !== toolCallId),
        );
      }
    } catch {
      if (isInputSave) {
        setFailedSaveToolCallIds((current) =>
          current.includes(toolCallId) ? current : [...current, toolCallId],
        );
      }

      reportFailure();
    } finally {
      setInFlightEditCount((count) => count - 1);
    }
  };

  const doItem = async () => {
    setIsRunning(true);

    try {
      await runInboxItemToolCalls({
        inboxItemId: inboxItem.id,
        expectedVersion: inboxItem.version,
      });
    } catch {
      reportFailure();
    } finally {
      setIsRunning(false);
    }
  };

  const dismissItem = () =>
    void transitionInboxItem({
      inboxItemId: inboxItem.id,
      transition: { kind: 'CLEAR', outcome: InboxItemOutcome.DISMISSED },
      expectedVersion: inboxItem.version,
    }).catch(reportFailure);

  const reopenItem = () =>
    void reopenInboxItem({
      inboxItemId: inboxItem.id,
      expectedVersion: inboxItem.version,
    }).catch(reportFailure);

  const doLabel =
    pendingToolCalls.length === 1
      ? t`Do 1 action`
      : pendingToolCalls.length > 1
        ? t`Do ${pendingToolCalls.length} actions`
        : toolCalls.length > 0
          ? t`Close plan`
          : t`Mark done`;

  return (
    <StyledView>
      <StyledScroll>
        <StyledHeader>
          <StyledType>
            <InboxItemTypeIcon size={theme.icon.size.sm} color="currentColor" />
            {inboxItem.inboxItemType.label}
          </StyledType>
          <span>
            {t`Updated ${beautifyPastDateRelativeToNow(inboxItem.lastEventAt)}`}
          </span>
        </StyledHeader>
        <StyledTitle>{inboxItem.title}</StyledTitle>

        {hasContext && (
          <StyledContextCard>
            {isNonEmptyString(context.summary) && (
              <StyledSummary>{context.summary}</StyledSummary>
            )}
            <InboxItemSubjectChip
              inboxItem={inboxItem}
              source={context.source}
            />
            <InboxPlanEntityGraph
              entities={context.entities}
              edges={context.edges}
            />
          </StyledContextCard>
        )}

        {toolCalls.length > 0 && (
          <>
            <StyledSectionTitle>{t`Plan`}</StyledSectionTitle>
            <InboxPlanActionsSummary
              toolCalls={toolCalls}
              onSelect={expandToolCall}
            />
            <StyledToolCallRows>
              {toolCalls.map((toolCall) => (
                <InboxPlanToolCallRow
                  key={toolCall.id}
                  toolCall={toolCall}
                  source={context.source}
                  isExpanded={expandedToolCallIds.includes(toolCall.id)}
                  onToggleExpanded={() => toggleToolCall(toolCall.id)}
                  onSave={(editedInput) =>
                    trackEdit(
                      () =>
                        updateInboxItemToolCallInput({
                          inboxItemToolCallId: toolCall.id,
                          editedInput,
                        }),
                      { toolCallId: toolCall.id, isInputSave: true },
                    )
                  }
                  onToggleRejected={(isRejected) =>
                    trackEdit(
                      () =>
                        setInboxItemToolCallRejected({
                          inboxItemToolCallId: toolCall.id,
                          isRejected,
                        }),
                      { toolCallId: toolCall.id, isInputSave: false },
                    )
                  }
                />
              ))}
            </StyledToolCallRows>
          </>
        )}
      </StyledScroll>

      <StyledFooter>
        <InboxListRowButtons inboxItem={inboxItem} />
        <StyledFooterEnd>
          {isDone ? (
            <>
              {isDefined(inboxItem.outcome) && (
                <Tag
                  color="gray"
                  text={getInboxItemOutcomeLabel(inboxItem.outcome)}
                />
              )}
              <Button
                onClick={reopenItem}
                size="small"
                title={t`Move to inbox`}
                variant="secondary"
              />
            </>
          ) : (
            <>
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
              <Button
                Icon={IconCheck}
                accent="blue"
                disabled={
                  isRunning ||
                  inFlightEditCount > 0 ||
                  failedSaveToolCallIds.length > 0
                }
                onClick={() => void doItem()}
                size="small"
                title={doLabel}
                variant="primary"
              />
            </>
          )}
        </StyledFooterEnd>
      </StyledFooter>
    </StyledView>
  );
};
