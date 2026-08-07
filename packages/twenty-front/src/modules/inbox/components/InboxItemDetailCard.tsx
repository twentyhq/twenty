import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { useContext, useState } from 'react';
import { AppPath } from 'twenty-shared/types';
import { getAppPath, isDefined } from 'twenty-shared/utils';
import { useIcons } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/input';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

import { useOpenAskAiThread } from '@/ai/hooks/useOpenAskAiThread';
import { InboxItemDetailCardActionButton } from '@/inbox/components/InboxItemDetailCardActionButton';
import { InboxItemActionInputModal } from '@/inbox/components/InboxItemActionInputModal';
import { INBOX_ITEM_NAVIGATION_KIND } from '@/inbox/constants/InboxItemNavigationKind';
import { useInboxItemActions } from '@/inbox/hooks/useInboxItemActions';
import { selectedInboxItemIdState } from '@/inbox/states/selectedInboxItemIdState';
import { objectMetadataItemsByIdMapSelector } from '@/object-metadata/states/objectMetadataItemsByIdMapSelector';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import {
  type InboxItem,
  type InboxItemAction,
  InboxItemStatus,
} from '~/generated/graphql';
import { beautifyPastDateRelativeToNow } from '~/utils/date-utils';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow-y: auto;
  padding: ${themeCssVariables.spacing[4]};
`;

const StyledCard = styled.div`
  background: ${themeCssVariables.background.secondary};
  border: 1px solid ${themeCssVariables.border.color.light};
  border-radius: ${themeCssVariables.border.radius.md};
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
  padding: ${themeCssVariables.spacing[4]};
`;

const StyledCardHeader = styled.div`
  align-items: flex-start;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledCardIcon = styled.div`
  align-items: center;
  background: ${themeCssVariables.background.transparent.blue};
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${themeCssVariables.color.blue};
  display: flex;
  justify-content: center;
  padding: ${themeCssVariables.spacing[1]};
`;

const StyledCardTitleBlock = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: ${themeCssVariables.spacing['0.5']};
  min-width: 0;
`;

const StyledCardTitle = styled.div`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.lg};
  font-weight: ${themeCssVariables.font.weight.semiBold};
`;

const StyledCardTimestamp = styled.div`
  color: ${themeCssVariables.font.color.light};
  font-size: ${themeCssVariables.font.size.xs};
`;

const StyledCardPreview = styled.div`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.md};
  line-height: ${themeCssVariables.text.lineHeight.md};
  white-space: pre-wrap;
`;

const StyledCardOutcome = styled.div`
  align-self: flex-start;
  background: ${themeCssVariables.background.transparent.light};
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.sm};
  padding: ${themeCssVariables.spacing[1]} ${themeCssVariables.spacing[2]};
`;

const StyledCardActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[2]};
`;

type InboxItemDetailCardProps = {
  inboxItem: InboxItem;
};

export const InboxItemDetailCard = ({
  inboxItem,
}: InboxItemDetailCardProps) => {
  const { t } = useLingui();
  const { theme } = useContext(ThemeContext);
  const [pendingAction, setPendingAction] = useState<InboxItemAction | null>(
    null,
  );
  const { getIcon } = useIcons();
  const { executeInboxItemAction, reopenInboxItem } = useInboxItemActions();
  const { openAskAiThread } = useOpenAskAiThread();
  const setSelectedInboxItemId = useSetAtomState(selectedInboxItemIdState);
  const objectMetadataItemsByIdMap = useAtomStateValue(
    objectMetadataItemsByIdMapSelector,
  );

  const InboxItemIcon = getIcon(inboxItem.inboxItemType.icon);
  const isResolved = inboxItem.status !== InboxItemStatus.OPEN;
  const outcomeLabel = inboxItem.inboxItemType.outcomes.find(
    (declaredOutcome) => declaredOutcome.key === inboxItem.outcome,
  )?.label;

  const subjectObjectMetadataItem = isDefined(inboxItem.subjectObjectMetadataId)
    ? objectMetadataItemsByIdMap.get(inboxItem.subjectObjectMetadataId)
    : undefined;

  const subjectRecordPath =
    isDefined(subjectObjectMetadataItem) && isDefined(inboxItem.subjectRecordId)
      ? getAppPath(AppPath.RecordShowPage, {
          objectNameSingular: subjectObjectMetadataItem.nameSingular,
          objectRecordId: inboxItem.subjectRecordId,
        })
      : null;

  return (
    <StyledContainer>
      <StyledCard>
        <StyledCardHeader>
          <StyledCardIcon>
            <InboxItemIcon size={theme.icon.size.md} color="currentColor" />
          </StyledCardIcon>
          <StyledCardTitleBlock>
            <StyledCardTitle>{inboxItem.title}</StyledCardTitle>
            <StyledCardTimestamp>
              {beautifyPastDateRelativeToNow(inboxItem.updatedAt)}
            </StyledCardTimestamp>
          </StyledCardTitleBlock>
        </StyledCardHeader>
        {isNonEmptyString(inboxItem.preview) && (
          <StyledCardPreview>{inboxItem.preview}</StyledCardPreview>
        )}
        {isDefined(inboxItem.outcome) && (
          <StyledCardOutcome>
            {outcomeLabel ?? inboxItem.outcome}
          </StyledCardOutcome>
        )}
        {isDefined(pendingAction) ? (
          <InboxItemActionInputModal
            action={pendingAction}
            onCancel={() => setPendingAction(null)}
            onSubmit={(input) => {
              setPendingAction(null);
              void executeInboxItemAction({
                inboxItemId: inboxItem.id,
                actionKey: pendingAction.key,
                input,
                expectedVersion: inboxItem.version,
              });
            }}
          />
        ) : (
          <StyledCardActions>
            {isResolved && (
              <Button
                onClick={() =>
                  void reopenInboxItem({
                    inboxItemId: inboxItem.id,
                    expectedVersion: inboxItem.version,
                  })
                }
                size="small"
                title={t`Move to inbox`}
                variant="secondary"
              />
            )}
            {inboxItem.inboxItemType.actions.map((action) => {
              // A resolved item cannot be transitioned again; the way back is
              // Move to inbox. Navigation still works, since reading an item
              // that has ended is perfectly reasonable.
              if (isResolved && isDefined(action.transitionKind)) {
                return null;
              }

              if (
                action.navigationKind === INBOX_ITEM_NAVIGATION_KIND.OPEN_THREAD
              ) {
                const threadId = inboxItem.threadId;

                if (!isDefined(threadId)) {
                  return null;
                }

                return (
                  <InboxItemDetailCardActionButton
                    key={action.key}
                    action={action}
                    onClick={() => {
                      // The chat panel becomes the reading pane, so the inbox
                      // one steps aside rather than competing for width
                      setSelectedInboxItemId(null);
                      openAskAiThread(threadId);
                    }}
                  />
                );
              }

              if (
                action.navigationKind ===
                INBOX_ITEM_NAVIGATION_KIND.OPEN_SUBJECT_RECORD
              ) {
                if (!isDefined(subjectRecordPath)) {
                  return null;
                }

                return (
                  <InboxItemDetailCardActionButton
                    key={action.key}
                    action={action}
                    to={subjectRecordPath}
                  />
                );
              }

              return (
                <InboxItemDetailCardActionButton
                  key={action.key}
                  action={action}
                  onClick={() => {
                    // What the action collects is declared by the type, so a
                    // form appears only when there is something to collect
                    if (action.inputSchema.length > 0) {
                      setPendingAction(action);

                      return;
                    }

                    void executeInboxItemAction({
                      inboxItemId: inboxItem.id,
                      actionKey: action.key,
                      expectedVersion: inboxItem.version,
                    });
                  }}
                />
              );
            })}
          </StyledCardActions>
        )}
      </StyledCard>
    </StyledContainer>
  );
};
