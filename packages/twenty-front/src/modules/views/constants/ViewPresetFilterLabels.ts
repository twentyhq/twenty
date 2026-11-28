import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { ViewPresetFilter } from '~/generated-metadata/graphql';

export const VIEW_PRESET_FILTER_LABELS: Record<
  ViewPresetFilter,
  MessageDescriptor
> = {
  [ViewPresetFilter.INBOX_OPEN]: msg({
    message: 'Open',
    context: 'Inbox thread status',
  }),
  [ViewPresetFilter.INBOX_SNOOZED]: msg`Snoozed`,
  [ViewPresetFilter.INBOX_DONE]: msg`Done`,
  [ViewPresetFilter.INBOX_MENTIONS]: msg`Mentions`,
  [ViewPresetFilter.INBOX_CHANNEL_OPEN]: msg({
    message: 'Open',
    context: 'Inbox thread status',
  }),
  [ViewPresetFilter.INBOX_CHANNEL_SNOOZED]: msg`Snoozed`,
  [ViewPresetFilter.INBOX_CHANNEL_DONE]: msg`Done`,
};
