import { registerEnumType } from '@nestjs/graphql';

// What the editor draws for a field and what a run checks the value against.
// OBJECT is the escape hatch for tools whose input nests, which most real ones
// do: it is edited as JSON rather than as a control of its own.
export enum InboxItemFieldType {
  TEXT = 'TEXT',
  LONG_TEXT = 'LONG_TEXT',
  NUMBER = 'NUMBER',
  BOOLEAN = 'BOOLEAN',
  OBJECT = 'OBJECT',
}

registerEnumType(InboxItemFieldType, { name: 'InboxItemFieldType' });
