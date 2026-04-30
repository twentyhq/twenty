export type IncidentSeverity =
  | 'critical'
  | 'high'
  | 'medium'
  | 'low';

export type IncidentStatus =
  | 'detected'
  | 'investigating'
  | 'identified'
  | 'mitigating'
  | 'resolved'
  | 'closed';

export type TimelineEventType =
  | 'created'
  | 'status_change'
  | 'assignment'
  | 'note'
  | 'escalation'
  | 'resolution';

export type Incident = {
  id: string;
  title: string;
  description: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  assigneeId: string | null;
  assigneeName: string | null;
  impactedSystems: string[];
  startedAt: string;
  resolvedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type IncidentTimelineEvent = {
  id: string;
  incidentId: string;
  type: TimelineEventType;
  description: string;
  authorName: string;
  createdAt: string;
  metadata: Record<string, string> | null;
};

export type Postmortem = {
  id: string;
  incidentId: string;
  summary: string;
  rootCause: string;
  impact: string;
  timeline: string;
  lessonsLearned: string[];
  actionItems: PostmortemActionItem[];
  createdAt: string;
  publishedAt: string | null;
};

export type PostmortemActionItem = {
  id: string;
  description: string;
  assigneeName: string;
  dueDate: string;
  completed: boolean;
};
