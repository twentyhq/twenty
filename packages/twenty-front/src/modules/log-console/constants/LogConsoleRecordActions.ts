import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import {
  type IconComponent,
  IconPencil,
  IconPlus,
  IconRefresh,
  IconRestore,
  IconTrash,
  IconTrashX,
} from 'twenty-ui/icon';
import { type ThemeColor } from 'twenty-ui/theme';

export const LOG_CONSOLE_RECORD_ACTIONS: Partial<
  Record<
    string,
    {
      label: MessageDescriptor;
      color: ThemeColor;
      Icon: IconComponent;
      summary?: MessageDescriptor;
      valuesTitle?: MessageDescriptor;
      valuesSnapshot?: 'before' | 'after';
      actorFieldName?: 'createdBy' | 'updatedBy';
    }
  >
> = {
  'Object Record Created': {
    label: msg`Created`,
    color: 'green',
    Icon: IconPlus,
    valuesTitle: msg`Initial values`,
    valuesSnapshot: 'after',
    actorFieldName: 'createdBy',
  },
  'Object Record Updated': {
    label: msg`Updated`,
    color: 'blue',
    Icon: IconPencil,
    valuesTitle: msg`Changes`,
    actorFieldName: 'updatedBy',
  },
  'Object Record Upserted': {
    label: msg`Upserted`,
    color: 'purple',
    Icon: IconRefresh,
    valuesTitle: msg`Changes`,
    actorFieldName: 'updatedBy',
  },
  'Object Record Deleted': {
    label: msg`Deleted`,
    color: 'red',
    Icon: IconTrash,
    summary: msg`Moved to trash`,
    valuesTitle: msg`Values before deletion`,
    valuesSnapshot: 'before',
  },
  'Object Record Restored': {
    label: msg`Restored`,
    color: 'turquoise',
    Icon: IconRestore,
    summary: msg`Restored from trash`,
  },
  'Object Record Destroyed': {
    label: msg`Permanently deleted`,
    color: 'red',
    Icon: IconTrashX,
    summary: msg`No values kept`,
    valuesTitle: msg`Values before deletion`,
    valuesSnapshot: 'before',
  },
};
