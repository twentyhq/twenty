export type PaymentFrameEvent =
  | { type: 'loaded' }
  | { type: 'ready'; hasWallets: boolean }
  | { type: 'resize'; height: number }
  | { type: 'confirmation-token'; confirmationTokenId: string }
  | { type: 'error'; message?: string };
