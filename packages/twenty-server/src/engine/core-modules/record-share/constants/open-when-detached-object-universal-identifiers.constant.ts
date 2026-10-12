/* @license Enterprise */

import { STANDARD_OBJECTS } from 'twenty-shared/metadata';

// Notes and tasks were open to every member before inheriting from targets, so detached ones stay open.
export const OPEN_WHEN_DETACHED_OBJECT_UNIVERSAL_IDENTIFIERS: string[] = [
  STANDARD_OBJECTS.note.universalIdentifier,
  STANDARD_OBJECTS.task.universalIdentifier,
];
