import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useContext, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { Tag } from 'twenty-ui/data-display';
import { IconClockHour8, IconX, useIcons } from 'twenty-ui/icon';
import { Button, LightIconButton } from 'twenty-ui/input';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

import { InboxPlanEntityGraph } from '@/inbox/components/InboxPlanEntityGraph';
import { InboxPlanToolCallEditor } from '@/inbox/components/InboxPlanToolCallEditor';
import { InboxPlanToolCallList } from '@/inbox/components/InboxPlanToolCallList';
import { useInboxItemActions } from '@/inbox/hooks/useInboxItemActions';
import { getInboxPlanContext } from '@/inbox/utils/getInboxPlanContext';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import {
  type InboxItem,
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

const StyledTitleRow = styled.div`
  align-items: baseline;
  display: flex;
  gap: ${themeCssVariables.spacing[3]};
  justify-content: space-between;
`;

const StyledTitle = styled.h1`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.xl};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  margin: 0;
`;

const StyledCreatedAt = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  flex-shrink: 0;
  font-size: ${themeCssVariables.font.size.sm};
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

const StyledSourceChip = styled.span`
  align-items: center;
  background: ${themeCssVariables.background.tertiary};
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${themeCssVariables.font.color.primary};
  display: inline-flex;
  font-weight: ${themeCssVariables.font.weight.medium};
  gap: ${themeCssVariables.spacing[1]};
  margin: 0 ${themeCssVariables.spacing[1]};
  padding: 0 ${themeCssVariables.spacing[1]};
  vertical-align: baseline;
`;

const StyledFooter = styled.div`
  align-items: center;
  border-top: 1px solid ${themeCssVariables.border.color.light};
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  justify-content: flex-end;
  padding: ${themeCssVariables.spacing[3]} ${themeCssVariables.spacing[4]};
`;

const SOURCE_ICON_BY_KIND = {
  email: 'IconMail',
  thread: 'IconMessageCircle',
  record: 'IconBuildingSkyscraper',
  call: 'IconPhone',
} as const;

// A plan: what the agent understood, the entities involved, the calls it wants
// to make, and one button to make them. Editing a call before running it is the
// person's review; skipping one is the person's veto.
export const InboxPlanView = ({ inboxItem }: { inboxItem: InboxItem }) => {
  const { t } = useLingui();
  const { theme } = useContext(ThemeContext);
  const { getIcon } = useIcons();
  const { enqueueErrorSnackBar } = useSnackBar();
  const {
    executeInboxItemAction,
    reopenInboxItem,
    runInboxItemToolCalls,
    updateInboxItemToolCallInput,
    setInboxItemToolCallRejected,
  } = useInboxItemActions();

  const context = getInboxPlanContext(inboxItem);
  const toolCalls = inboxItem.toolCalls;
  const pendingToolCalls = toolCalls.filter(
    (toolCall) => toolCall.status === InboxItemToolCallStatus.PROPOSED,
  );
  const isDone = inboxItem.scope === InboxItemScope.DONE;

  const [selectedToolCallId, setSelectedToolCallId] = useState<string | null>(
    () => pendingToolCalls[0]?.id ?? toolCalls[0]?.id ?? null,
  );
  const [isRunning, setIsRunning] = useState(false);
  const [inFlightEditCount, setInFlightEditCount] = useState(0);

  const selectedToolCall =
    toolCalls.find((toolCall) => toolCall.id === selectedToolCallId) ?? null;

  const reportFailure = () =>
    enqueueErrorSnackBar({ message: t`That could not be applied` });

  // A blur save or a skip still on the wire must land before the plan runs,
  // or the run could use the input from before the edit
  const trackEdit = async (edit: () => Promise<unknown>) => {
    setInFlightEditCount((count) => count + 1);

    try {
      await edit();
    } catch {
      reportFailure();
    } finally {
      setInFlightEditCount((count) => count - 1);
    }
  };

  const findControl = (key: string) =>
    inboxItem.inboxItemType.actions.find(
      (action) => action.key === key && isDefined(action.transitionKind),
    );
  const snoozeControl = findControl('snooze');
  const dismissControl = findControl('dismiss');

  const runControl = (actionKey: string) =>
    void executeInboxItemAction({
      inboxItemId: inboxItem.id,
      actionKey,
      expectedVersion: inboxItem.version,
    }).catch(reportFailure);

  const runAll = async () => {
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

  const outcomeLabel = inboxItem.inboxItemType.outcomes.find(
    (outcome) => outcome.key === inboxItem.outcome,
  )?.label;

  const SourceIcon = isDefined(context?.source)
    ? getIcon(SOURCE_ICON_BY_KIND[context.source.kind])
    : null;

  return (
    <StyledView>
      <StyledScroll>
        <StyledTitleRow>
          <StyledTitle>{inboxItem.title}</StyledTitle>
          <StyledCreatedAt>
            {t`Created ${beautifyPastDateRelativeToNow(inboxItem.lastEventAt)}`}
          </StyledCreatedAt>
        </StyledTitleRow>

        <StyledSectionTitle>{t`Context`}</StyledSectionTitle>
        <StyledContextCard>
          {isDefined(context) ? (
            <>
              <StyledSummary>
                {isDefined(context.source) && isDefined(SourceIcon) && (
                  <>
                    {t`in`}
                    <StyledSourceChip>
                      <SourceIcon size={theme.icon.size.sm} />
                      {context.source.label}
                    </StyledSourceChip>
                  </>
                )}
                {context.summary}
              </StyledSummary>
              <InboxPlanEntityGraph
                entities={context.entities ?? []}
                edges={context.edges ?? []}
              />
            </>
          ) : (
            <StyledSummary>{inboxItem.preview}</StyledSummary>
          )}
          <InboxPlanToolCallList
            toolCalls={toolCalls}
            selectedToolCallId={selectedToolCallId}
            onSelect={setSelectedToolCallId}
          />
        </StyledContextCard>

        {isDefined(selectedToolCall) && (
          <InboxPlanToolCallEditor
            // Remounted per call so the draft always belongs to the row shown
            key={`${selectedToolCall.id}-${selectedToolCall.status}`}
            toolCall={selectedToolCall}
            source={context?.source}
            onSave={(editedInput) =>
              trackEdit(() =>
                updateInboxItemToolCallInput({
                  inboxItemToolCallId: selectedToolCall.id,
                  editedInput,
                }),
              )
            }
            onToggleRejected={(isRejected) =>
              trackEdit(() =>
                setInboxItemToolCallRejected({
                  inboxItemToolCallId: selectedToolCall.id,
                  isRejected,
                }),
              )
            }
          />
        )}
      </StyledScroll>

      <StyledFooter>
        {isDone ? (
          <>
            <Tag color="gray" text={outcomeLabel ?? inboxItem.outcome ?? ''} />
            <Button
              onClick={() => {
                void reopenInboxItem({
                  inboxItemId: inboxItem.id,
                  expectedVersion: inboxItem.version,
                }).catch(reportFailure);
              }}
              size="small"
              title={t`Move to inbox`}
              variant="secondary"
            />
          </>
        ) : (
          <>
            {isDefined(dismissControl) && (
              <LightIconButton
                Icon={IconX}
                accent="secondary"
                aria-label={dismissControl.label}
                title={dismissControl.label}
                onClick={() => runControl(dismissControl.key)}
              />
            )}
            {isDefined(snoozeControl) && (
              <LightIconButton
                Icon={IconClockHour8}
                accent="secondary"
                aria-label={snoozeControl.label}
                title={snoozeControl.label}
                onClick={() => runControl(snoozeControl.key)}
              />
            )}
            <Button
              accent="blue"
              disabled={
                toolCalls.length === 0 || isRunning || inFlightEditCount > 0
              }
              onClick={() => void runAll()}
              size="small"
              title={
                pendingToolCalls.length === 0
                  ? t`Close plan`
                  : pendingToolCalls.length === 1
                    ? t`Do 1 action`
                    : t`Do ${pendingToolCalls.length} actions`
              }
              variant="primary"
            />
          </>
        )}
      </StyledFooter>
    </StyledView>
  );
};
