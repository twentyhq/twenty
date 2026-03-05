// System fields that should be hidden from the UI by default.
// Other system fields (createdAt, updatedAt, deletedAt, createdBy, updatedBy)
// are isSystem: true but remain user-visible.
export const HIDDEN_SYSTEM_FIELD_NAMES = new Set([
  'id',
  'searchVector',
  'position',
]);
