export type InboxItemContextSource = {
  kind: 'email' | 'thread' | 'record' | 'call';
  label: string;
  detail?: string;
  excerpt?: string;
  messageCount?: number;
};

export type InboxItemContextEntity = {
  key: string;
  label: string;
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

// Mirrors the server's inbox item context; the API carries it as JSON.
export type InboxItemContext = {
  summary?: string;
  source?: InboxItemContextSource;
  entities: InboxItemContextEntity[];
  edges: InboxItemContextEdge[];
};
