export class GranolaWebhookConfigurationError extends Error {
  constructor({ message }: { message: string }) {
    super(message);
    this.name = 'GranolaWebhookConfigurationError';
  }
}
