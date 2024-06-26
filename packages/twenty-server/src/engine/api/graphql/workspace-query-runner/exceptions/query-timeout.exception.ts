export class QueryTimeoutException extends Error {
  constructor(message: string) {
    super(`Query timeout: ${message}`);
  }
}
