// What an item is about, structured enough to draw: a line of summary, the
// source it came from, the entities involved and how they relate. This is the
// only payload an item carries; producers fill in what they know and the
// engine only stores and returns it.
export type InboxItemContextSource = {
  kind: 'email' | 'thread' | 'record' | 'call';
  label: string;
  // A short line under the label: who wrote, when, how many messages
  detail?: string;
  excerpt?: string;
  messageCount?: number;
};

export type InboxItemContextEntity = {
  key: string;
  label: string;
  // Shown under the label, so the reader knows the role without opening it
  subtitle?: string;
  kind: 'person' | 'company' | 'opportunity' | 'other';
  recordId?: string;
  objectMetadataId?: string;
};

export type InboxItemContextEdge = {
  from: string;
  to: string;
  label: string;
};

export type InboxItemContext = {
  summary?: string;
  source?: InboxItemContextSource;
  entities?: InboxItemContextEntity[];
  edges?: InboxItemContextEdge[];
};
