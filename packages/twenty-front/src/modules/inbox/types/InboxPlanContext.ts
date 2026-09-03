export type InboxPlanContextSource = {
  kind: 'email' | 'thread' | 'record' | 'call';
  label: string;
  detail?: string;
  excerpt?: string;
  messageCount?: number;
};

export type InboxPlanContextEntity = {
  key: string;
  label: string;
  subtitle?: string;
  kind: 'person' | 'company' | 'opportunity' | 'other';
  recordId?: string;
  objectMetadataId?: string;
};

export type InboxPlanContextEdge = {
  from: string;
  to: string;
  label: string;
};

// Mirrors the server's inbox item context; the API carries it as JSON.
export type InboxPlanContext = {
  summary: string;
  source?: InboxPlanContextSource;
  entities?: InboxPlanContextEntity[];
  edges?: InboxPlanContextEdge[];
};
