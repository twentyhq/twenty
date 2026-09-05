import { isDefined } from 'twenty-shared/utils';

import { type InboxItemToolCallEntity } from 'src/engine/core-modules/inbox/entities/inbox-item-tool-call.entity';
import { type InboxItemFieldSchema } from 'src/engine/core-modules/inbox/types/inbox-item-field-schema.type';

const isTextFieldType = (type: InboxItemFieldSchema['type']) =>
  type === 'TEXT' || type === 'LONG_TEXT';

const isValueOfFieldType = (
  type: InboxItemFieldSchema['type'],
  value: unknown,
): boolean => {
  switch (type) {
    case 'NUMBER':
      return typeof value === 'number' && Number.isFinite(value);
    case 'BOOLEAN':
      return typeof value === 'boolean';
    case 'TEXT':
    case 'LONG_TEXT':
      return typeof value === 'string';
    default:
      return false;
  }
};

export const findInvalidInputKeys = (
  toolCall: Pick<
    InboxItemToolCallEntity,
    'inputSchema' | 'proposedInput' | 'editedInput'
  >,
): string[] => {
  const input = (toolCall.editedInput ??
    toolCall.proposedInput ??
    {}) as Record<string, unknown>;

  return toolCall.inputSchema
    .filter((field) => {
      const value = input[field.key];

      if (!isDefined(value)) {
        return field.isRequired === true;
      }

      // A blank string is an absent text; for any other type it is a value of
      // the wrong kind.
      if (typeof value === 'string' && value.trim() === '') {
        return field.isRequired === true || !isTextFieldType(field.type);
      }

      return !isValueOfFieldType(field.type, value);
    })
    .map((field) => field.key);
};
