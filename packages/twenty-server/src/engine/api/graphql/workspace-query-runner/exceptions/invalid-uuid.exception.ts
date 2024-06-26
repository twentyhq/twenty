export class InvalidUuidException extends Error {
  constructor(uuid: string) {
    super(`Invalid UUID: ${uuid}`);
  }
}
