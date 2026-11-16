// Lets outcome logging tell a guard refusal from a network failure without matching on a message
export class OutboundRequestBlockedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'OutboundRequestBlockedError';
  }
}
