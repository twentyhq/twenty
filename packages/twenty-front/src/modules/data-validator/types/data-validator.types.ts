export type TruthStatus =
  | 'candidate'
  | 'supported'
  | 'approved'
  | 'deprecated';

export type ReviewAction = 'approve' | 'reject' | 'support' | 'skip';

export type JustusTruthRecord = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  truthText: string;
  domain: string | null;
  claimType: string | null;
  sourceContext: string | null;
  status: string | null;
  evidenceCount: number | null;
  contextSummary: string | null;
  sourceDate: string | null;
  meetingTopic: string | null;
  confidence: string | null;
  truthForm: string | null;
  approvedBy: string | null;
  approvedAt: string | null;
};

export type UndoEntry = {
  truthId: string;
  action: ReviewAction;
  previousStatus: string | null;
  previousApprovedBy: string | null;
  previousApprovedAt: string | null;
  truthText: string;
  record: JustusTruthRecord;
};

export type SessionStats = {
  approved: number;
  rejected: number;
  supported: number;
  skipped: number;
  startedAt: number;
  reviewTimes: number[];
};

export type TruthFilterValues = {
  searchTerm: string;
  domain: string;
  claimType: string;
  status: string;
  evidenceCountMin: string;
};

export type ValidatorViewMode = 'review' | 'list';
