// Only what a model reads natively; everything else stays a file name in the
// prompt, which is what the assistant did for every file before attachments
export const SLACK_ASSISTANT_ATTACHMENT_MIME_TYPES: readonly string[] = [
  'image/png',
  'image/jpeg',
  'image/gif',
  'image/webp',
  'application/pdf',
];
