export type LineMessageContent =
  | { status: 'downloaded'; content: Uint8Array; contentType: string | null }
  | { status: 'tooLarge' }
  | { status: 'unavailable' };
