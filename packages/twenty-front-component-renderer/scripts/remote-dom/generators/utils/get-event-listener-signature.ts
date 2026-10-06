export const getEventListenerSignature = (eventName: string): string =>
  `${eventName}(event: Event): void`;
