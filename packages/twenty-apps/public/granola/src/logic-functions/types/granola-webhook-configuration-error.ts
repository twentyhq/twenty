export class GranolaWebhookConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'GranolaWebhookConfigurationError';
  }
}
