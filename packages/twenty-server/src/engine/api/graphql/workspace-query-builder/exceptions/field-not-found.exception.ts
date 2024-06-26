export class FieldNotFound extends Error {
  constructor(field: string) {
    super(`Field ${field} not found`);
  }
}
