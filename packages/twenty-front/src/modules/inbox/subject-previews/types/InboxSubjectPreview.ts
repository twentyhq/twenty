import { type ComponentType } from 'react';

import { type InboxItem } from '~/generated/graphql';

export type InboxSubjectPreviewProps = {
  inboxItem: InboxItem;
  subjectRecordId: string;
};

// How the thing an item is about is glanced at, decided per object. A preview
// is read-only context and never edits: the chip still opens the real record,
// and anything to do goes through the plan.
export type InboxSubjectPreview = {
  Preview: ComponentType<InboxSubjectPreviewProps>;
};
