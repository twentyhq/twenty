export class TeamsBotConnectorKeysUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TeamsBotConnectorKeysUnavailableError';
  }
}
