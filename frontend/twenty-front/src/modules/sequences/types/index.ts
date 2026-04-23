export type SequenceStatus = 'active' | 'paused' | 'completed' | 'draft';

export type StepType = 'email' | 'wait' | 'task' | 'sms';

export interface SequenceStep {
  id: string;
  sequenceId: string;
  order: number;
  type: StepType;
  config: Record<string, unknown>;
  createdAt: Date;
}

export interface EmailSequence {
  id: string;
  workspaceId: string;
  name: string;
  description?: string;
  status: SequenceStatus;
  enrolledCount: number;
  completedCount: number;
  replyCount: number;
  replyRate: number;
  createdAt: Date;
}

export interface SequenceEnrollment {
  id: string;
  workspaceId: string;
  sequenceId: string;
  contactId: string;
  status: 'active' | 'paused' | 'completed' | 'replied' | 'bounced';
  currentStepOrder: number;
  currentStepId: string | null;
  nextActionAt: Date | null;
  lastActionAt: Date | null;
  enrolledAt: Date;
  completedAt: Date | null;
  emailsSent: number;
  emailsOpened: number;
  emailsClicked: number;
  replies: number;
}

export interface SequenceStats {
  enrolled: number;
  active: number;
  completed: number;
  replied: number;
  replyRate: number;
}
