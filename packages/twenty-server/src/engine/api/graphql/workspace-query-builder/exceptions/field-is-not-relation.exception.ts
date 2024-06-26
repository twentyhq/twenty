export class FieldIsNotRelationException extends Error {
  constructor(field: string) {
    super(`Field ${field} is not a relation`);
  }
}
