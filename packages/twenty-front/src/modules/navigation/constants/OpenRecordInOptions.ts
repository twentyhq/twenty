import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { OpenRecordIn } from 'twenty-shared/types';
import {
  IconAddressBook,
  type IconComponent,
  IconLayoutSidebarRight,
} from 'twenty-ui/icon';

export const OPEN_RECORD_IN_OPTIONS = {
  [OpenRecordIn.SIDE_PANEL]: {
    Icon: IconLayoutSidebarRight,
    label: msg`Side panel`,
  },
  [OpenRecordIn.RECORD_PAGE]: {
    Icon: IconAddressBook,
    label: msg`Full page`,
  },
} satisfies Record<
  OpenRecordIn,
  { Icon: IconComponent; label: MessageDescriptor }
>;
