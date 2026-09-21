// Substrings Recall matches (case-insensitive) against participant names to
// classify them as recording bots rather than humans. Covers our own bot plus
// common third-party notetakers so a call full of bots is treated as empty.
export const RECALL_BOT_DETECTION_DEFAULT_NAME_MATCHES = [
  'notetaker',
  'note taker',
  'recorder',
  'recording',
  'transcriber',
  'otter',
  'fireflies',
  'tl;dv',
  'tldv',
  'grain',
  'read.ai',
  'fathom',
  'fellow',
  'avoma',
  'sembly',
  'nyota',
];
