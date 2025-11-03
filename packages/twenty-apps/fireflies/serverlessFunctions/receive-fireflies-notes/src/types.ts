// Fireflies API Types
export type FirefliesParticipant = {
  email: string;
  name: string;
};

export type FirefliesWebhookPayload = {
  meetingId: string;
  eventType: string;
  clientReferenceId?: string;
};

export type FirefliesMeetingData = {
  id: string;
  title: string;
  date: string;
  duration: number;
  participants: FirefliesParticipant[];
  organizer_email?: string;
  summary: {
    action_items: string[];
    keywords?: string[];
    overview: string;
    gist?: string;
    topics_discussed?: string[];
    meeting_type?: string;
    bullet_gist?: string;
  };
  analytics?: {
    sentiments?: {
      positive_pct: number;
      negative_pct: number;
      neutral_pct: number;
    };
  };
  transcript_url: string;
  recording_url?: string;
  summary_status?: string;
};

// Configuration Types
export type SummaryStrategy = 'immediate_only' | 'immediate_with_retry' | 'delayed_polling' | 'basic_only';

export type SummaryFetchConfig = {
  strategy: SummaryStrategy;
  retryAttempts: number;
  retryDelay: number;
  pollInterval: number;
  maxPolls: number;
};

export type WebhookConfig = {
  secret: string;
  apiUrl: string;
};

// Processing Result Types
export type ProcessResult = {
  success: boolean;
  meetingId?: string;
  noteIds?: string[];
  newContacts?: string[];
  errors?: string[];
  debug?: string[];
  summaryReady?: boolean;
  summaryPending?: boolean;
  enhancementScheduled?: boolean;
  actionItemsCount?: number;
  sentimentScore?: number;
  meetingType?: string;
  keyTopics?: string[];
};

// Twenty CRM Types
export type GraphQLResponse<T> = {
  data: T;
  errors?: Array<{
    message?: string;
    extensions?: { code?: string }
  }>;
};

export type IdNode = { id: string };

export type FindMeetingResponse = {
  meetings: { edges: Array<{ node: IdNode }> };
};

export type FindPeopleResponse = {
  people: { edges: Array<{ node: { id: string; emails: { primaryEmail: string } } }> };
};

export type CreatePersonResponse = {
  createPerson: { id: string }
};

export type CreateNoteResponse = {
  createNote: { id: string }
};

export type CreateMeetingResponse = {
  createMeeting: { id: string }
};

export type Contact = {
  id: string;
  email: string;
};

export type MeetingCreateInput = {
  name: string;
  noteId?: string | null; // This is the relation field
  meetingDate: string;
  duration: number;
  meetingType?: string | null;
  keywords?: string | null;
  sentimentScore?: number | null;
  positivePercent?: number | null;
  negativePercent?: number | null;
  actionItemsCount: number;
  transcriptUrl?: { primaryLinkUrl: string; primaryLinkLabel: string } | null;
  recordingUrl?: { primaryLinkUrl: string; primaryLinkLabel: string } | null;
  firefliesMeetingId: string;
  organizerEmail?: string | null;
  importStatus?: 'SUCCESS' | 'FAILED' | 'PENDING' | 'RETRYING' | null;
  importError?: string | null;
  lastImportAttempt?: string | null;
  importAttempts?: number | null;
};

