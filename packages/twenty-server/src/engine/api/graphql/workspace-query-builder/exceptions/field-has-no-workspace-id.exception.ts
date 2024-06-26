export class FieldHasNoWorkspaceIdException extends Error {
  constructor(fieldId: string) {
    super(`Field ${fieldId} has no workspace ID`);
  }
}
