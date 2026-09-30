/* @license Enterprise */

import { STANDARD_OBJECTS } from 'twenty-shared/metadata';

// Notes and tasks were readable by every member before they inherited from
// their targets, so one attached to nothing stays that way instead of falling
// back to its creator only
export const OPEN_WHEN_DETACHED_OBJECT_UNIVERSAL_IDENTIFIERS: string[] = [
  STANDARD_OBJECTS.note.universalIdentifier,
  STANDARD_OBJECTS.task.universalIdentifier,
];
