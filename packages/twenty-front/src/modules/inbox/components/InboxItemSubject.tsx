import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useEffect } from 'react';
import { isDefined, isValidUuid } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { AiChatTab } from '@/ai/components/AiChatTab';
import { useSwitchAgentChatThreadWithDraft } from '@/ai/hooks/useSwitchAgentChatThreadWithDraft';
import { TimelineActivityContext } from '@/activities/timeline-activities/contexts/TimelineActivityContext';
import { CommandMenuComponentInstanceContext } from '@/command-menu/states/contexts/CommandMenuComponentInstanceContext';
import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
import { objectMetadataItemsByIdMapSelector } from '@/object-metadata/states/objectMetadataItemsByIdMapSelector';
import { RecordComponentInstanceContextsWrapper } from '@/object-record/components/RecordComponentInstanceContextsWrapper';
import { PageLayoutRecordPageRenderer } from '@/object-record/record-show/components/PageLayoutRecordPageRenderer';
import { RecordShowPageSSESubscribeEffect } from '@/object-record/record-show/components/RecordShowPageSSESubscribeEffect';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { type InboxItem } from '~/generated/graphql';

const StyledSubject = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
`;

const StyledEmptySubject = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.light};
  display: flex;
  flex: 1;
  font-size: ${themeCssVariables.font.size.md};
  justify-content: center;
  padding: ${themeCssVariables.spacing[10]};
`;

const InboxItemThreadSubject = ({ threadId }: { threadId: string }) => {
  const { switchThreadWithDraft } = useSwitchAgentChatThreadWithDraft();

  // The chat reads its thread from global state rather than from props, so the
  // page points it at this item's thread on the way in
  useEffect(() => {
    if (isValidUuid(threadId)) {
      switchThreadWithDraft(threadId);
    }
  }, [threadId, switchThreadWithDraft]);

  return (
    <StyledSubject>
      <AiChatTab />
    </StyledSubject>
  );
};

const InboxItemRecordSubject = ({
  recordId,
  objectNameSingular,
}: {
  recordId: string;
  objectNameSingular: string;
}) => (
  <RecordComponentInstanceContextsWrapper
    componentInstanceId={`inbox-item-record-${recordId}`}
  >
    <ContextStoreComponentInstanceContext.Provider
      value={{ instanceId: `inbox-item-record-${recordId}` }}
    >
      <CommandMenuComponentInstanceContext.Provider
        value={{ instanceId: `inbox-item-record-${recordId}` }}
      >
        <TimelineActivityContext.Provider value={{ recordId }}>
          <StyledSubject>
            <PageLayoutRecordPageRenderer
              targetRecordIdentifier={{
                id: recordId,
                targetObjectNameSingular: objectNameSingular,
              }}
              isInSidePanel={false}
            />
            <RecordShowPageSSESubscribeEffect
              objectNameSingular={objectNameSingular}
              recordId={recordId}
              queryScope="record-show"
            />
          </StyledSubject>
        </TimelineActivityContext.Provider>
      </CommandMenuComponentInstanceContext.Provider>
    </ContextStoreComponentInstanceContext.Provider>
  </RecordComponentInstanceContextsWrapper>
);

// The focused view owns the chrome and embeds whatever the item is about, so
// every kind of work gets the same frame instead of each redirecting to its
// subject's own page.
export const InboxItemSubject = ({ inboxItem }: { inboxItem: InboxItem }) => {
  const { t } = useLingui();
  const objectMetadataItemsByIdMap = useAtomStateValue(
    objectMetadataItemsByIdMapSelector,
  );

  if (isDefined(inboxItem.threadId)) {
    return <InboxItemThreadSubject threadId={inboxItem.threadId} />;
  }

  const objectMetadataItem = isDefined(inboxItem.subjectObjectMetadataId)
    ? objectMetadataItemsByIdMap.get(inboxItem.subjectObjectMetadataId)
    : undefined;

  if (isDefined(objectMetadataItem) && isDefined(inboxItem.subjectRecordId)) {
    return (
      <InboxItemRecordSubject
        recordId={inboxItem.subjectRecordId}
        objectNameSingular={objectMetadataItem.nameSingular}
      />
    );
  }

  return <StyledEmptySubject>{t`Nothing more to show`}</StyledEmptySubject>;
};
