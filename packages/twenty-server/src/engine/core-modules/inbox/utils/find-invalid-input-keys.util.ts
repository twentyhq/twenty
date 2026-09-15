import { isDefined, isPlainObject } from 'twenty-shared/utils';

import { InboxItemFieldType } from 'src/engine/core-modules/inbox/enums/inbox-item-field-type.enum';
import { type InboxItemToolCallEntity } from 'src/engine/core-modules/inbox/entities/inbox-item-tool-call.entity';

const isTextFieldType = (type: InboxItemFieldType) =>
  type === InboxItemFieldType.TEXT || type === InboxItemFieldType.LONG_TEXT;

const isValueOfFieldType = (
  type: InboxItemFieldType,
  value: unknown,
): boolean => {
  switch (type) {
    case InboxItemFieldType.NUMBER:
      return typeof value === 'number' && Number.isFinite(value);
    case InboxItemFieldType.BOOLEAN:
      return typeof value === 'boolean';
    case InboxItemFieldType.TEXT:
    case InboxItemFieldType.LONG_TEXT:
      return typeof value === 'string';
    case InboxItemFieldType.OBJECT:
      return isPlainObject(value) || Array.isArray(value);
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
        return field.isRequired;
      }

      // A blank string is an absent text; for any other type it is a value of
      // the wrong kind.
      if (typeof value === 'string' && value.trim() === '') {
        return field.isRequired || !isTextFieldType(field.type);
      }

      return !isValueOfFieldType(field.type, value);
    })
    .map((field) => field.key);
};
