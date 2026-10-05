import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { type RelativeDateFilterDirection } from 'twenty-shared/utils';

type RelativeDateDirectionOption = {
  value: RelativeDateFilterDirection;
  label: MessageDescriptor;
};

export const RELATIVE_DATE_DIRECTION_SELECT_OPTIONS: RelativeDateDirectionOption[] =
  [
    { value: 'PAST', label: msg`Past` },
    { value: 'THIS', label: msg`This` },
    { value: 'NEXT', label: msg`Next` },
  ];
