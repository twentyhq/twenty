export class RecordsNotFoundException extends Error {
  constructor(ids?: string[]) {
    super(`Records ${ids} not found`);
  }
}
