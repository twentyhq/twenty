export class InvalidQueryInputException extends Error {
  constructor(message: string) {
    super(`Invalid query input: ${message}`);
  }
}
