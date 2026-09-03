import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { AiChatTab } from '@/ai/components/AiChatTab';
import { InboxItemThreadSubjectEffect } from '@/inbox/components/InboxItemThreadSubjectEffect';
import { TimelineActivityContext } from '@/activities/timeline-activities/contexts/TimelineActivityContext';
import { CommandMenuComponentInstanceContext } from '@/command-menu/states/contexts/CommandMenuComponentInstanceContext';
import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
import { getInboxItemSubject } from '@/inbox/utils/getInboxItemSubject';
import { useRecordShowPageResource } from '@/object-record/record-show/hooks/useRecordShowPageResource';
import { objectMetadataItemsByIdMapSelector } from '@/object-metadata/states/objectMetadataItemsByIdMapSelector';
import { RecordComponentInstanceContextsWrapper } from '@/object-record/components/RecordComponentInstanceContextsWrapper';
import { PageLayoutRecordPageRenderer } from '@/object-record/record-show/components/PageLayoutRecordPageRenderer';
import { RecordShowPageResourceEffect } from '@/object-record/record-show/components/RecordShowPageResourceEffect';
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

const InboxItemThreadSubject = ({ threadId }: { threadId: string }) => (
  <StyledSubject>
    <InboxItemThreadSubjectEffect threadId={threadId} />
    <AiChatTab />
  </StyledSubject>
);

const getInboxItemRecordInstanceId = (recordId: string) =>
  `inbox-item-record-${recordId}`;

const InboxItemRecordSubject = ({
  recordId,
  objectNameSingular,
}: {
  recordId: string;
  objectNameSingular: string;
}) => {
  const { loading, record } = useRecordShowPageResource({
    objectNameSingular,
    recordId,
  });

  return (
    <RecordComponentInstanceContextsWrapper
      componentInstanceId={getInboxItemRecordInstanceId(recordId)}
    >
      <ContextStoreComponentInstanceContext.Provider
        value={{ instanceId: getInboxItemRecordInstanceId(recordId) }}
      >
        <CommandMenuComponentInstanceContext.Provider
          value={{ instanceId: getInboxItemRecordInstanceId(recordId) }}
        >
          <TimelineActivityContext.Provider value={{ recordId }}>
            <StyledSubject>
              <RecordShowPageResourceEffect
                loading={loading}
                record={record}
                recordId={recordId}
              />
              <PageLayoutRecordPageRenderer
                targetRecordIdentifier={{
                  id: recordId,
                  targetObjectNameSingular: objectNameSingular,
                }}
              />
              <RecordShowPageSSESubscribeEffect
                objectNameSingular={objectNameSingular}
                recordId={recordId}
              />
            </StyledSubject>
          </TimelineActivityContext.Provider>
        </CommandMenuComponentInstanceContext.Provider>
      </ContextStoreComponentInstanceContext.Provider>
    </RecordComponentInstanceContextsWrapper>
  );
};

// The focused view owns the chrome and embeds whatever the item is about, so
// every kind of work gets the same frame instead of each redirecting to its
// subject's own page.
export const InboxItemSubject = ({ inboxItem }: { inboxItem: InboxItem }) => {
  const { t } = useLingui();
  const objectMetadataItemsByIdMap = useAtomStateValue(
    objectMetadataItemsByIdMapSelector,
  );

  const subject = getInboxItemSubject(inboxItem, objectMetadataItemsByIdMap);

  if (subject?.kind === 'thread') {
    return <InboxItemThreadSubject threadId={subject.threadId} />;
  }

  if (subject?.kind === 'record') {
    return (
      <InboxItemRecordSubject
        recordId={subject.recordId}
        objectNameSingular={subject.objectNameSingular}
      />
    );
  }

  return <StyledEmptySubject>{t`Nothing more to show`}</StyledEmptySubject>;
};
