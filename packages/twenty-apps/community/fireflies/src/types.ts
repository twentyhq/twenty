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

// Transcript sentence from Fireflies API
export type FirefliesSentence = {
  index: number;
  speaker_name: string;
  text: string;
  start_time: string;
  end_time: string;
  ai_filters?: {
    task?: boolean;
    question?: boolean;
    sentiment?: string;
  };
};

// Speaker analytics from Fireflies API (Business+)
export type FirefliesSpeakerAnalytics = {
  speaker_id: string;
  name: string;
  duration: number;
  word_count: number;
  longest_monologue: number;
  filler_words: number;
  questions: number;
  words_per_minute: number;
};

// Based on Fireflies GraphQL API transcript schema
// See: https://docs.fireflies.ai/graphql-api/query/transcript
export type FirefliesMeetingData = {
  id: string;
  title: string;
  date: string;
  duration: number;
  participants: FirefliesParticipant[];
  organizer_email?: string;
  // Full transcript (Pro+)
  sentences?: FirefliesSentence[];
  summary: {
    // Pro+ fields
    action_items: string[];
    keywords?: string[];
    overview: string;
    notes?: string;           // Detailed AI-generated meeting notes
    gist?: string;            // 1-sentence summary
    bullet_gist?: string;     // Bullet point summary with emojis
    short_summary?: string;   // Single paragraph summary
    short_overview?: string;  // Brief overview
    outline?: string;         // Meeting outline with timestamps
    shorthand_bullet?: string;
    // Business+ fields
    topics_discussed?: string[];
    meeting_type?: string;
    transcript_chapters?: string[];
  };
  // Business+ analytics
  analytics?: {
    sentiments?: {
      positive_pct: number;
      negative_pct: number;
      neutral_pct: number;
    };
    categories?: {
      questions: number;
      tasks: number;
      metrics: number;
      date_times: number;
    };
    speakers?: FirefliesSpeakerAnalytics[];
  };
  meeting_info?: {
    summary_status?: string;
  };
  // URLs
  transcript_url: string;
  audio_url?: string;      // Pro+
  video_url?: string;      // Business+
  meeting_link?: string;   // All plans
  summary_status?: string;
};

export type FirefliesTranscriptListItem = {
  id: string;
  title: string;
  date?: string;
  duration?: number;
  organizer_email?: string;
  participants?: string[];
  transcript_url?: string;
  meeting_link?: string;
  summary_status?: string;
};

export type FirefliesTranscriptListOptions = {
  limit?: number;
  skip?: number;
  organizers?: string[];
  participants?: string[];
  hostEmail?: string;
  participantEmail?: string;
  userId?: string;
  channelId?: string;
  mine?: boolean;
  fromDate?: number;
  toDate?: number;
  pageSize?: number;
  maxRecords?: number;
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

export const FIREFLIES_PLANS = {
  FREE: 'free',
  PRO: 'pro',
  BUSINESS: 'business',
  ENTERPRISE: 'enterprise',
} as const;

export type FirefliesPlan = typeof FIREFLIES_PLANS[keyof typeof FIREFLIES_PLANS];

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
  sentimentAnalysis?: {
    positive_pct: number;
    negative_pct: number;
    neutral_pct: number;
  };
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

// Twenty CRM Meeting custom field input
// Maps to fields defined in add-meeting-fields.ts
export type MeetingCreateInput = {
  name: string;
  noteId?: string | null;
  // Basic fields (All plans)
  meetingDate: string;
  duration: number;
  firefliesMeetingId: string;
  organizerEmail?: string | null;
  transcriptUrl?: { primaryLinkUrl: string; primaryLinkLabel: string } | null;
  meetingLink?: { primaryLinkUrl: string; primaryLinkLabel: string } | null;
  // Pro+ fields
  transcript?: string | null;
  overview?: string | null;
  notes?: string | null;
  keywords?: string | null;
  audioUrl?: { primaryLinkUrl: string; primaryLinkLabel: string } | null;
  // Business+ fields
  meetingType?: string | null;
  topics?: string | null;
  actionItemsCount: number;
  positivePercent?: number | null;
  negativePercent?: number | null;
  neutralPercent?: number | null;
  videoUrl?: { primaryLinkUrl: string; primaryLinkLabel: string } | null;
  // Import tracking
  importStatus?: 'SUCCESS' | 'PARTIAL' | 'FAILED' | 'PENDING' | 'RETRYING' | null;
  importError?: string | null;
  lastImportAttempt?: string | null;
  importAttempts?: number | null;
};

