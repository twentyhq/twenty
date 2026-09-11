// System fields written by the server itself: they are neither editable in the
// UI nor settable by an automation, whatever the object they belong to.
export const SERVER_MANAGED_SYSTEM_FIELD_NAMES = new Set([
  'createdAt',
  'updatedAt',
  'deletedAt',
  'createdBy',
  'updatedBy',
]);
