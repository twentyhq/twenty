import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { useContext } from 'react';
import { AppPath } from 'twenty-shared/types';
import { getAppPath, isDefined } from 'twenty-shared/utils';
import { useIcons } from 'twenty-ui/icon';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

import { useOpenAskAiThread } from '@/ai/hooks/useOpenAskAiThread';
import { InboxItemDetailCardActionButton } from '@/inbox/components/InboxItemDetailCardActionButton';
import { INBOX_ITEM_ACTION_HANDLER_KIND } from '@/inbox/constants/InboxItemActionHandlerKind';
import { useInboxItemActions } from '@/inbox/hooks/useInboxItemActions';
import { useInboxItemById } from '@/inbox/hooks/useInboxItemById';
import { objectMetadataItemsByIdMapSelector } from '@/object-metadata/states/objectMetadataItemsByIdMapSelector';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { type InboxItemScope } from '~/generated/graphql';
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

const StyledCardActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledEmptyState = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.light};
  display: flex;
  flex: 1;
  font-size: ${themeCssVariables.font.size.md};
  justify-content: center;
`;

type InboxItemDetailCardProps = {
  inboxItemId: string;
  scope?: InboxItemScope;
};

export const InboxItemDetailCard = ({
  inboxItemId,
  scope,
}: InboxItemDetailCardProps) => {
  const { t } = useLingui();
  const { theme } = useContext(ThemeContext);
  const { getIcon } = useIcons();
  const { inboxItem, loading, error } = useInboxItemById(inboxItemId, scope);
  const { executeInboxItemAction } = useInboxItemActions();
  const { openAskAiThread } = useOpenAskAiThread();
  const objectMetadataItemsByIdMap = useAtomStateValue(
    objectMetadataItemsByIdMapSelector,
  );

  if (!isDefined(inboxItem)) {
    if (loading) {
      return <StyledContainer />;
    }

    return (
      <StyledContainer>
        <StyledEmptyState>
          {isDefined(error)
            ? t`This inbox item could not be loaded`
            : t`This inbox item is no longer available`}
        </StyledEmptyState>
      </StyledContainer>
    );
  }

  const InboxItemIcon = getIcon(inboxItem.inboxItemType.icon);

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
        <StyledCardActions>
          {inboxItem.inboxItemType.actions.map((action) => {
            if (
              action.handlerKind === INBOX_ITEM_ACTION_HANDLER_KIND.OPEN_THREAD
            ) {
              const threadId = inboxItem.threadId;

              if (!isDefined(threadId)) {
                return null;
              }

              return (
                <InboxItemDetailCardActionButton
                  key={action.key}
                  action={action}
                  onClick={() => openAskAiThread(threadId)}
                />
              );
            }

            if (
              action.handlerKind ===
              INBOX_ITEM_ACTION_HANDLER_KIND.OPEN_SUBJECT_RECORD
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
                onClick={() =>
                  void executeInboxItemAction(inboxItem.id, action.key)
                }
              />
            );
          })}
        </StyledCardActions>
      </StyledCard>
    </StyledContainer>
  );
};
