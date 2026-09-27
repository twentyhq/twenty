import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { type ThemeColor } from 'twenty-ui/theme';

export const LOG_CONSOLE_RECORD_ACTIONS: Partial<
  Record<
    string,
    {
      label: MessageDescriptor;
      color: ThemeColor;
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
    valuesTitle: msg`Initial values`,
    valuesSnapshot: 'after',
    actorFieldName: 'createdBy',
  },
  'Object Record Updated': {
    label: msg`Updated`,
    color: 'blue',
    valuesTitle: msg`Changes`,
    actorFieldName: 'updatedBy',
  },
  'Object Record Upserted': {
    label: msg`Upserted`,
    color: 'purple',
    valuesTitle: msg`Changes`,
    actorFieldName: 'updatedBy',
  },
  'Object Record Deleted': {
    label: msg`Deleted`,
    color: 'red',
    summary: msg`Moved to trash`,
    valuesTitle: msg`Values before deletion`,
    valuesSnapshot: 'before',
  },
  'Object Record Restored': {
    label: msg`Restored`,
    color: 'turquoise',
    summary: msg`Restored from trash`,
  },
  'Object Record Destroyed': {
    label: msg`Permanently deleted`,
    color: 'red',
    summary: msg`No values kept`,
    valuesTitle: msg`Values before deletion`,
    valuesSnapshot: 'before',
  },
};
