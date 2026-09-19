import { type ComponentType } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { InboxToolCallStarterButton } from '@/inbox/components/InboxToolCallStarterButton';
import { useInboxItemPlanContext } from '@/inbox/hooks/useInboxItemPlanContext';
import { InboxDefaultSubjectPreview } from '@/inbox/subject-previews/components/InboxDefaultSubjectPreview';
import { type InboxSubjectPreviewProps } from '@/inbox/subject-previews/types/InboxSubjectPreview';
import { type InboxPreviewSubject } from '@/inbox/subject-previews/utils/getInboxPreviewSubject';
import { type InboxToolCallStarterEntry } from '@/inbox/tool-call-renderers/utils/getInboxToolCallStarters';

type InboxItemContextSlotProps = {
  previewSubject: InboxPreviewSubject | null;
  Preview: ComponentType<InboxSubjectPreviewProps> | undefined;
  starters: InboxToolCallStarterEntry[];
};

// The preview of what the item is about, then the tools a person can start
// from it. The preview does not know the starters exist; the registry says
// which tools start from this object and the slot draws them underneath.
export const InboxItemContextSlot = ({
  previewSubject,
  Preview,
  starters,
}: InboxItemContextSlotProps) => {
  const { inboxItem } = useInboxItemPlanContext();

  return (
    <>
      {isDefined(previewSubject) && isDefined(Preview) ? (
        <Preview
          inboxItem={inboxItem}
          subjectRecordId={previewSubject.recordId}
        />
      ) : (
        <InboxDefaultSubjectPreview inboxItem={inboxItem} />
      )}
      {starters.map((entry) => (
        <InboxToolCallStarterButton
          key={entry.toolName}
          starter={entry.starter}
        />
      ))}
    </>
  );
};
