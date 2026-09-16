import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { useState } from 'react';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { Tag } from 'twenty-ui/primitives/data-display';
import { IconCheck, IconClockHour8, IconX } from 'twenty-ui/icon';
import { Button, LightIconButton } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { useToast } from 'twenty-ui/primitives/feedback';

import { InboxItemSubjectChip } from '@/inbox/components/InboxItemSubjectChip';
import { InboxItemThreadView } from '@/inbox/components/InboxItemThreadView';
import { InboxPlanActionsSummary } from '@/inbox/components/InboxPlanActionsSummary';
import { InboxPlanEntityGraph } from '@/inbox/components/InboxPlanEntityGraph';
import { InboxPlanToolCallRow } from '@/inbox/components/InboxPlanToolCallRow';
import { InboxSnoozeDropdown } from '@/inbox/components/InboxSnoozeDropdown';
import { useInboxItemActions } from '@/inbox/hooks/useInboxItemActions';
import { getInboxItemMessageThreadId } from '@/inbox/utils/getInboxItemMessageThreadId';
import { getInboxItemOutcomeLabel } from '@/inbox/utils/getInboxItemOutcomeLabel';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import {
  type InboxItem,
  type InboxItemField,
  InboxItemOutcome,
  InboxItemScope,
  InboxItemToolCallStatus,
} from '~/generated/graphql';
import { EMAIL_TOOL_CALL_INPUT_SCHEMA } from '@/inbox/tool-call-renderers/email/constants/EmailToolCallInputSchema';

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

type InboxItemViewProps = {
  inboxItem: InboxItem;
  // Called once a run leaves the item done, so the list can move on the way
  // a mail client does after send.
  onItemCompleted?: () => void;
};

export const InboxItemView = ({
  inboxItem,
  onItemCompleted,
}: InboxItemViewProps) => {
  const { t } = useLingui();
  const { enqueueToast } = useToast();
  const { objectMetadataItems } = useObjectMetadataItems();
  const {
    transitionInboxItem,
    reopenInboxItem,
    runInboxItemToolCalls,
    runInboxItemToolCall,
    createInboxItemToolCall,
    updateInboxItemToolCallInput,
    setInboxItemToolCallRejected,
  } = useInboxItemActions();

  const messageThreadId = getInboxItemMessageThreadId({
    inboxItem,
    messageThreadObjectMetadataId: objectMetadataItems.find(
      (objectMetadataItem) =>
        objectMetadataItem.nameSingular ===
        CoreObjectNameSingular.MessageThread,
    )?.id,
  });

  const context = inboxItem.context;
  const summary = inboxItem.summary;
  const toolCalls = inboxItem.toolCalls;
  const pendingToolCalls = toolCalls.filter(
    (toolCall) => toolCall.status === InboxItemToolCallStatus.PROPOSED,
  );
  const isDone = inboxItem.scope === InboxItemScope.DONE;
  const hasContext =
    isNonEmptyString(summary) ||
    isDefined(context.source) ||
    isDefined(inboxItem.threadId) ||
    isDefined(inboxItem.subjectRecordId) ||
    inboxItem.records.length > 0;

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
    enqueueToast({ variant: 'error', children: t`That could not be applied` });

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

  // Editors that save on a delay register how to land what is still pending,
  // so a run never reads a row the person had already moved past. A stable
  // container rather than state: nothing renders from it.
  const [pendingFlushes] = useState(
    () => new Map<string, () => Promise<void>>(),
  );

  const registerFlush = (
    toolCallId: string,
    flush: (() => Promise<void>) | null,
  ) => {
    if (isDefined(flush)) {
      pendingFlushes.set(toolCallId, flush);
    } else {
      pendingFlushes.delete(toolCallId);
    }
  };

  const flushPendingEdits = () =>
    Promise.all([...pendingFlushes.values()].map((flush) => flush()));

  const runGuarded = async (run: () => Promise<InboxItem | undefined>) => {
    setIsRunning(true);

    try {
      await flushPendingEdits();

      const inboxItemAfterRun = await run();

      if (inboxItemAfterRun?.scope === InboxItemScope.DONE) {
        onItemCompleted?.();
      }
    } catch {
      reportFailure();
    } finally {
      setIsRunning(false);
    }
  };

  const doItem = () =>
    runGuarded(() =>
      runInboxItemToolCalls({
        inboxItemId: inboxItem.id,
        expectedVersion: inboxItem.version,
      }),
    );

  const runToolCall = (toolCallId: string) =>
    runGuarded(() =>
      runInboxItemToolCall({
        inboxItemToolCallId: toolCallId,
        expectedVersion: inboxItem.version,
      }),
    );

  const createAndRunToolCall = (draft: {
    toolName: string;
    label: string;
    icon: string;
    proposedInput: Record<string, unknown>;
  }) =>
    runGuarded(async () => {
      const toolCall = await createInboxItemToolCall({
        inboxItemId: inboxItem.id,
        ...draft,
        inputSchema: EMAIL_TOOL_CALL_INPUT_SCHEMA as Omit<
          InboxItemField,
          '__typename'
        >[],
      });

      if (!isDefined(toolCall)) {
        return undefined;
      }

      return runInboxItemToolCall({
        inboxItemToolCallId: toolCall.id,
        expectedVersion: inboxItem.version,
      });
    });

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

  const isBusy =
    isRunning || inFlightEditCount > 0 || failedSaveToolCallIds.length > 0;

  const footerControls = isDone ? (
    <>
      {isDefined(inboxItem.outcome) && (
        <Tag color="gray">{getInboxItemOutcomeLabel(inboxItem.outcome)}</Tag>
      )}
      <Button onClick={reopenItem} size="sm" variant="outline">
        {t`Move to inbox`}
      </Button>
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
    </>
  );

  if (isDefined(messageThreadId)) {
    return (
      <StyledView>
        <StyledScroll>
          {isNonEmptyString(summary) && (
            <StyledSummary>{summary}</StyledSummary>
          )}
          <InboxItemThreadView
            inboxItem={inboxItem}
            threadId={messageThreadId}
            isBusy={isBusy}
            footerControls={footerControls}
            onSaveToolCallInput={(toolCallId, editedInput) =>
              trackEdit(
                () =>
                  updateInboxItemToolCallInput({
                    inboxItemToolCallId: toolCallId,
                    editedInput,
                  }),
                { toolCallId, isInputSave: true },
              )
            }
            onToggleToolCallRejected={(toolCallId, isRejected) =>
              trackEdit(
                () =>
                  setInboxItemToolCallRejected({
                    inboxItemToolCallId: toolCallId,
                    isRejected,
                  }),
                { toolCallId, isInputSave: false },
              )
            }
            onRunToolCall={runToolCall}
            onRunAll={doItem}
            onCreateAndRunToolCall={createAndRunToolCall}
          />
        </StyledScroll>
      </StyledView>
    );
  }

  return (
    <StyledView>
      <StyledScroll>
        {hasContext && (
          <StyledContextCard>
            {isNonEmptyString(summary) && (
              <StyledSummary>{summary}</StyledSummary>
            )}
            <InboxItemSubjectChip
              inboxItem={inboxItem}
              source={context.source ?? undefined}
            />
            <InboxPlanEntityGraph records={inboxItem.records} />
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
                  source={context.source ?? undefined}
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
                  onRegisterFlush={(flush) => registerFlush(toolCall.id, flush)}
                />
              ))}
            </StyledToolCallRows>
          </>
        )}
      </StyledScroll>

      <StyledFooter>
        <StyledFooterEnd>
          {footerControls}
          {!isDone && (
            <Button
              startIcon={<IconCheck />}
              color="accent"
              disabled={isBusy}
              onClick={() => void doItem()}
              size="sm"
              variant="solid"
            >
              {doLabel}
            </Button>
          )}
        </StyledFooterEnd>
      </StyledFooter>
    </StyledView>
  );
};
