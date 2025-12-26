import * as crypto from 'crypto';

import {
  main,
  type FirefliesMeetingData,
  type FirefliesWebhookPayload,
} from '../';

// Helper to generate HMAC signature
const generateHMACSignature = (body: string, secret: string): string => {
  const signature = crypto
    .createHmac('sha256', secret)
    .update(body, 'utf8')
    .digest('hex');
  return `sha256=${signature}`;
};

// Mock raw Fireflies API response with full summary (before transformation)
const mockFirefliesApiResponseWithSummary = {
  id: 'test-meeting-001',
  title: 'Product Demo with Client',
  date: '2024-11-02T14:00:00Z',
  duration: 1800,
  participants: [
    'Sarah Sales <sales@company.com>',
    'John Client <client@customer.com>',
  ],
  organizer_email: 'sales@company.com',
  summary: {
    action_items: [
      'Follow up with pricing proposal by Friday',
      'Schedule technical deep-dive next week',
      'Share case studies from similar clients',
    ],
    keywords: ['product demo', 'pricing', 'technical requirements', 'integration'],
    overview: 'Successful product demonstration with positive client feedback. Client expressed strong interest in the enterprise plan and requested technical documentation for their IT team.',
    gist: 'Product demo went well, client interested in enterprise plan, next steps identified',
    topics_discussed: ['product features', 'pricing discussion', 'integration capabilities', 'support options'],
    meeting_type: 'Sales Call',
    bullet_gist: '• Demonstrated core product features\n• Discussed enterprise pricing\n• Addressed integration questions',
  },
  analytics: {
    sentiments: {
      positive_pct: 75,
      negative_pct: 10,
      neutral_pct: 15,
    },
  },
  transcript_url: 'https://app.fireflies.ai/transcript/test-001',
  video_url: 'https://app.fireflies.ai/recording/test-001',
  summary_status: 'completed',
};

// Transformed meeting data (after fetchFirefliesMeetingData processes it)
const mockMeetingWithFullSummary: FirefliesMeetingData = {
  id: 'test-meeting-001',
  title: 'Product Demo with Client',
  date: '2024-11-02T14:00:00Z',
        duration: 1800,
  participants: [
    { email: 'sales@company.com', name: 'Sarah Sales' },
    { email: 'client@customer.com', name: 'John Client' },
  ],
  organizer_email: 'sales@company.com',
  summary: {
    action_items: [
      'Follow up with pricing proposal by Friday',
      'Schedule technical deep-dive next week',
      'Share case studies from similar clients',
    ],
    keywords: ['product demo', 'pricing', 'technical requirements', 'integration'],
    overview: 'Successful product demonstration with positive client feedback. Client expressed strong interest in the enterprise plan and requested technical documentation for their IT team.',
    gist: 'Product demo went well, client interested in enterprise plan, next steps identified',
    topics_discussed: ['product features', 'pricing discussion', 'integration capabilities', 'support options'],
    meeting_type: 'Sales Call',
    bullet_gist: '• Demonstrated core product features\n• Discussed enterprise pricing\n• Addressed integration questions',
  },
  analytics: {
    sentiments: {
      positive_pct: 75,
      negative_pct: 10,
      neutral_pct: 15,
    },
  },
  transcript_url: 'https://app.fireflies.ai/transcript/test-001',
  video_url: 'https://app.fireflies.ai/recording/test-001',
  summary_status: 'completed',
};

// Mock raw API response without summary (processing)
const mockFirefliesApiResponseWithoutSummary = {
  id: 'test-meeting-002',
  title: 'Team Standup',
  date: '2024-11-02T15:00:00Z',
  duration: 900,
  participants: [
    'Alice Developer <dev1@company.com>',
    'Bob Developer <dev2@company.com>',
  ],
  organizer_email: 'dev1@company.com',
  summary: {
    action_items: [],
    keywords: [],
    overview: '',
    gist: '',
    topics_discussed: [],
  },
  transcript_url: 'https://app.fireflies.ai/transcript/test-002',
  summary_status: 'processing',
};

// Mock meeting data without summary (processing) - currently unused but kept for reference
const _mockMeetingWithoutSummary = {
  id: 'test-meeting-002',
  title: 'Team Standup',
  date: '2024-11-02T15:00:00Z',
  duration: 900,
  participants: [
    { email: 'dev1@company.com', name: 'Alice Developer' },
    { email: 'dev2@company.com', name: 'Bob Developer' },
  ],
  organizer_email: 'dev1@company.com',
  summary: {
    action_items: [],
    keywords: [],
    overview: '',
    gist: '',
    topics_discussed: [],
  },
  transcript_url: 'https://app.fireflies.ai/transcript/test-002',
  summary_status: 'processing',
};

// Mock raw API response for team meeting
const mockFirefliesApiResponseTeamMeeting = {
  ...mockFirefliesApiResponseWithSummary,
  id: 'test-team-003',
  title: 'Sprint Planning',
  participants: [
    'Alice Scrum <scrum@company.com>',
    'Bob Developer <dev1@company.com>',
    'Carol Coder <dev2@company.com>',
    'David QA <qa@company.com>',
  ],
  summary: {
    ...mockFirefliesApiResponseWithSummary.summary,
    meeting_type: 'Sprint Planning',
  },
};

// Mock team meeting with multiple participants (transformed) - currently unused but kept for reference
const _mockTeamMeeting = {
  ...mockMeetingWithFullSummary,
  id: 'test-team-003',
  title: 'Sprint Planning',
        participants: [
    { email: 'scrum@company.com', name: 'Alice Scrum' },
    { email: 'dev1@company.com', name: 'Bob Developer' },
    { email: 'dev2@company.com', name: 'Carol Coder' },
    { email: 'qa@company.com', name: 'David QA' },
  ],
  summary: {
    ...mockMeetingWithFullSummary.summary,
    meeting_type: 'Sprint Planning',
  },
};

// Mock environment variables
const originalEnv = process.env;

beforeEach(() => {
  process.env = {
    ...originalEnv,
    FIREFLIES_WEBHOOK_SECRET: 'test_webhook_secret',
    FIREFLIES_API_KEY: 'test_fireflies_api_key',
    TWENTY_API_KEY: 'test_twenty_api_key',
    SERVER_URL: 'http://localhost:3000',
    AUTO_CREATE_CONTACTS: 'true',
    DEBUG_LOGS: 'false',
    FIREFLIES_SUMMARY_STRATEGY: 'immediate_with_retry',
    FIREFLIES_RETRY_ATTEMPTS: '3',
    FIREFLIES_RETRY_DELAY: '1000',
  };
});

afterEach(() => {
  process.env = originalEnv;
  jest.clearAllMocks();
});

describe('Fireflies Webhook Integration v2', () => {
  describe('Webhook Authentication', () => {
    it('should verify HMAC SHA-256 signature from x-hub-signature header', async () => {
      const payload: FirefliesWebhookPayload = {
        meetingId: 'test-meeting-001',
        eventType: 'Transcription completed',
      };

      const body = JSON.stringify(payload);
      const signature = generateHMACSignature(body, 'test_webhook_secret');

      // Mock Fireflies API
      global.fetch = jest.fn().mockImplementation((url: string) => {
        if (url === 'https://api.fireflies.ai/graphql') {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              data: {
                transcript: mockFirefliesApiResponseWithSummary, // Use raw API format
              },
            }),
          });
        }
        // Twenty API mocks
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            data: {
              meetings: { edges: [] },
              people: { edges: [] },
              createPerson: { id: 'new-person-id' },
              createNote: { id: 'new-note-id' },
              createMeeting: { id: 'new-meeting-id' },
            },
          }),
        });
      });

      const result = await main(payload, { 'x-hub-signature': signature, body });

      expect(result.success).toBe(true);
    });

    it('should reject requests with invalid signature', async () => {
      const payload: FirefliesWebhookPayload = {
        meetingId: 'test-meeting-001',
        eventType: 'Transcription completed',
      };

      const body = JSON.stringify(payload);
      const invalidSignature = 'sha256=invalid_signature_here';

      const result = await main(payload, { 'x-hub-signature': invalidSignature, body });

      expect(result.success).toBe(false);
      expect(result.errors).toContain('Invalid webhook signature');
    });

    it('should reject requests without signature header', async () => {
      const payload: FirefliesWebhookPayload = {
        meetingId: 'test-meeting-001',
        eventType: 'Transcription completed',
      };

      const result = await main(payload, {});

      expect(result.success).toBe(false);
      expect(result.errors).toContain('Invalid webhook signature');
    });

    it('should reject requests with missing webhook secret env var', async () => {
      delete process.env.FIREFLIES_WEBHOOK_SECRET;

      const payload: FirefliesWebhookPayload = {
        meetingId: 'test-meeting-001',
        eventType: 'Transcription completed',
      };

      const result = await main(payload, {});

      expect(result.success).toBe(false);
    });
  });

  describe('Fireflies GraphQL Integration', () => {
    it('should fetch meeting data from Fireflies API', async () => {
      const payload: FirefliesWebhookPayload = {
        meetingId: 'test-meeting-001',
        eventType: 'Transcription completed',
      };

      const body = JSON.stringify(payload);
      const signature = generateHMACSignature(body, 'test_webhook_secret');

      const firefliesApiMock = jest.fn();

      global.fetch = jest.fn().mockImplementation((url: string) => {
        if (url === 'https://api.fireflies.ai/graphql') {
          firefliesApiMock();
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              data: {
                transcript: mockFirefliesApiResponseWithSummary, // Use raw API format
              },
            }),
          });
        }
        // Twenty API mocks
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            data: {
              meetings: { edges: [] },
              people: { edges: [] },
              createPerson: { id: 'new-person-id' },
              createNote: { id: 'new-note-id' },
              createMeeting: { id: 'new-meeting-id' },
            },
          }),
        });
      });

      const result = await main(payload, { 'x-hub-signature': signature, body });

      expect(firefliesApiMock).toHaveBeenCalled();
      expect(result.success).toBe(true);
    });

    it('should handle Fireflies API fetch failures gracefully', async () => {
      const payload: FirefliesWebhookPayload = {
        meetingId: 'test-meeting-001',
        eventType: 'Transcription completed',
      };

      const body = JSON.stringify(payload);
      const signature = generateHMACSignature(body, 'test_webhook_secret');

      global.fetch = jest.fn().mockImplementation((url: string) => {
        if (url === 'https://api.fireflies.ai/graphql') {
          return Promise.reject(new Error('Fireflies API unavailable'));
        }
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ data: {} }) });
      });

      const result = await main(payload, { 'x-hub-signature': signature, body });

      expect(result.success).toBe(false);
      expect(result.errors?.[0]).toContain('Fireflies API');
    });

    it('should handle malformed GraphQL responses', async () => {
      const payload: FirefliesWebhookPayload = {
        meetingId: 'test-meeting-001',
        eventType: 'Transcription completed',
      };

      const body = JSON.stringify(payload);
      const signature = generateHMACSignature(body, 'test_webhook_secret');

      global.fetch = jest.fn().mockImplementation((url: string) => {
        if (url === 'https://api.fireflies.ai/graphql') {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              data: { malformed: 'response' },
            }),
          });
        }
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ data: {} }) });
      });

      const result = await main(payload, { 'x-hub-signature': signature, body });

      expect(result.success).toBe(false);
      expect(result.errors?.[0]).toContain('Invalid response from Fireflies API');
    });
  });

  describe('Summary Processing', () => {
    it('should create complete records when summary is ready', async () => {
      const payload: FirefliesWebhookPayload = {
        meetingId: 'test-meeting-001',
        eventType: 'Transcription completed',
      };

      const body = JSON.stringify(payload);
      const signature = generateHMACSignature(body, 'test_webhook_secret');

      global.fetch = jest.fn().mockImplementation((url: string) => {
        if (url === 'https://api.fireflies.ai/graphql') {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              data: { transcript: mockFirefliesApiResponseWithSummary }, // Use raw API format
            }),
          });
        }
        // Twenty API mocks
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            data: {
              meetings: { edges: [] },
              people: { edges: [] },
              createPerson: { id: 'new-person-id' },
              createNote: { id: 'new-note-id' },
              createMeeting: { id: 'new-meeting-id' },
            },
          }),
        });
      });

      const result = await main(payload, { 'x-hub-signature': signature, body });

      expect(result.success).toBe(true);
      expect(result.summaryReady).toBe(true);
      expect(result.actionItemsCount).toBe(3);
      expect(result.sentimentAnalysis).toEqual({
        positive_pct: 75,
        negative_pct: 10,
        neutral_pct: 15,
      });
      expect(result.meetingType).toBe('Sales Call');
      expect(result.keyTopics).toEqual(['product features', 'pricing discussion', 'integration capabilities', 'support options']);
    });

    it('should create basic records when summary is pending', async () => {
      const payload: FirefliesWebhookPayload = {
        meetingId: 'test-meeting-002',
        eventType: 'Transcription completed',
      };

      const body = JSON.stringify(payload);
      const signature = generateHMACSignature(body, 'test_webhook_secret');

      global.fetch = jest.fn().mockImplementation((url: string) => {
        if (url === 'https://api.fireflies.ai/graphql') {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              data: { transcript: mockFirefliesApiResponseWithoutSummary }, // Use raw API format
            }),
          });
        }
        // Twenty API mocks
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            data: {
              meetings: { edges: [] },
              people: { edges: [] },
              createPerson: { id: 'new-person-id' },
              createNote: { id: 'new-note-id' },
              createMeeting: { id: 'new-meeting-id' },
            },
          }),
        });
      });

      const result = await main(payload, { 'x-hub-signature': signature, body });

      expect(result.success).toBe(true);
      expect(result.summaryPending).toBe(true);
      expect(result.noteIds || result.meetingId).toBeDefined();
    });

    it('should retry summary fetch with exponential backoff', async () => {
      const payload: FirefliesWebhookPayload = {
        meetingId: 'test-meeting-003',
        eventType: 'Transcription completed',
      };

      const body = JSON.stringify(payload);
      const signature = generateHMACSignature(body, 'test_webhook_secret');

      let attemptCount = 0;

      global.fetch = jest.fn().mockImplementation((url: string) => {
        if (url === 'https://api.fireflies.ai/graphql') {
          attemptCount++;
          // First two attempts return no summary, third returns full summary
          if (attemptCount < 3) {
            return Promise.resolve({
              ok: true,
              json: () => Promise.resolve({
                data: { transcript: mockFirefliesApiResponseWithoutSummary }, // Use raw API format
              }),
            });
          }
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              data: { transcript: mockFirefliesApiResponseWithSummary }, // Use raw API format
            }),
          });
        }
        // Twenty API mocks
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            data: {
              meetings: { edges: [] },
              people: { edges: [] },
              createPerson: { id: 'new-person-id' },
              createNote: { id: 'new-note-id' },
              createMeeting: { id: 'new-meeting-id' },
            },
          }),
        });
      });

      const result = await main(payload, { 'x-hub-signature': signature, body });

      expect(attemptCount).toBe(3);
      expect(result.success).toBe(true);
      expect(result.summaryReady).toBe(true);
    });

    it('should handle immediate_only strategy with single fetch attempt', async () => {
      const payload: FirefliesWebhookPayload = {
        meetingId: 'test-meeting-004',
        eventType: 'Transcription completed',
      };

      const body = JSON.stringify(payload);
      const signature = generateHMACSignature(body, 'test_webhook_secret');

      let fetchCount = 0;

      global.fetch = jest.fn().mockImplementation((url: string) => {
        if (url === 'https://api.fireflies.ai/graphql') {
          fetchCount++;
          // Return summary not ready
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              data: { transcript: mockFirefliesApiResponseWithoutSummary },
            }),
          });
        }
        // Twenty API mocks
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            data: {
              meetings: { edges: [] },
              people: { edges: [] },
              createPerson: { id: 'new-person-id' },
              createNote: { id: 'new-note-id' },
              createMeeting: { id: 'new-meeting-id' },
            },
          }),
        });
      });

      // Override strategy for this test
      process.env.FIREFLIES_SUMMARY_STRATEGY = 'immediate_only';

      const result = await main(payload, { 'x-hub-signature': signature, body });

      // Should only fetch once with immediate_only strategy
      expect(fetchCount).toBe(1);
      expect(result.success).toBe(true);
      expect(result.summaryPending).toBe(true);

      // Reset to default
      process.env.FIREFLIES_SUMMARY_STRATEGY = 'immediate_with_retry';
    });
  });

  describe('CRM Record Creation', () => {
    it('should create summary-focused notes for 1-on-1 meetings', async () => {
      const payload: FirefliesWebhookPayload = {
        meetingId: 'test-meeting-001',
        eventType: 'Transcription completed',
      };

      const body = JSON.stringify(payload);
      const signature = generateHMACSignature(body, 'test_webhook_secret');

      const createNoteMock = jest.fn();

      global.fetch = jest.fn().mockImplementation((url: string, options?: RequestInit) => {
        if (url === 'https://api.fireflies.ai/graphql') {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              data: { transcript: mockFirefliesApiResponseWithSummary }, // Use raw API format
            }),
          });
        }

        // Twenty API
        const requestBody = options?.body ? JSON.parse(options.body as string) : {};
        if (requestBody.query?.includes('createNote')) {
          createNoteMock(requestBody.variables);
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              data: { createNote: { id: 'new-note-id' } },
            }),
        });
      }

      return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            data: {
              meetings: { edges: [] },
              people: { edges: [] },
              createPerson: { id: 'new-person-id' },
              createMeeting: { id: 'new-meeting-id' },
            },
          }),
        });
      });

      const result = await main(payload, { 'x-hub-signature': signature, body });

      expect(result.success).toBe(true);
      expect(createNoteMock).toHaveBeenCalled();

      const noteData = createNoteMock.mock.calls[0][0];
      expect(noteData.data.title).toContain('Meeting:');
      expect(noteData.data.bodyV2.markdown).toContain('## Overview'); // Markdown header, not bold
      expect(noteData.data.bodyV2.markdown).toContain('## Action Items'); // Markdown header, not bold
      expect(noteData.data.bodyV2.markdown).toContain('**Sentiment:**'); // This is bold
      expect(noteData.data.bodyV2.markdown).toContain('View Full Transcript on Fireflies');
    });

    it('should create meeting records for multi-party meetings', async () => {
      const payload: FirefliesWebhookPayload = {
        meetingId: 'test-team-003',
        eventType: 'Transcription completed',
      };

      const body = JSON.stringify(payload);
      const signature = generateHMACSignature(body, 'test_webhook_secret');

      const createMeetingMock = jest.fn();

      global.fetch = jest.fn().mockImplementation((url: string, options?: RequestInit) => {
        if (url === 'https://api.fireflies.ai/graphql') {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              data: { transcript: mockFirefliesApiResponseTeamMeeting }, // Use raw API format
            }),
          });
        }

        // Twenty API
        const requestBody = options?.body ? JSON.parse(options.body as string) : {};
        if (requestBody.query?.includes('createMeeting')) {
          createMeetingMock(requestBody.variables);
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              data: { createMeeting: { id: 'new-meeting-id' } },
            }),
          });
        }
        if (requestBody.query?.includes('createNote')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              data: { createNote: { id: 'new-note-id' } },
            }),
          });
        }

        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            data: {
              meetings: { edges: [] },
              people: { edges: [] },
              createPerson: { id: 'new-person-id' },
            },
          }),
        });
      });

      const result = await main(payload, { 'x-hub-signature': signature, body });

      expect(result.success).toBe(true);
      expect(result.meetingId).toBeDefined();
      expect(createMeetingMock).toHaveBeenCalled();
    });
  });

  describe('Error Handling & Resilience', () => {
    it('should never throw uncaught exceptions', async () => {
      const payload: FirefliesWebhookPayload = {
        meetingId: 'test-critical-error',
        eventType: 'Transcription completed',
      };

      const body = JSON.stringify(payload);
      const signature = generateHMACSignature(body, 'test_webhook_secret');

      global.fetch = jest.fn().mockImplementation(() => {
        throw new Error('Critical failure');
      });

      await expect(main(payload, { 'x-hub-signature': signature, body })).resolves.toEqual(
        expect.objectContaining({ success: false, errors: expect.any(Array) })
      );
    });

    it('should handle missing payload gracefully', async () => {
      const result = await main(null as unknown, {});

      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
    });

    it('should handle invalid payload structure', async () => {
      const invalidPayload = { invalid: 'data' };

      const result = await main(invalidPayload as unknown, {});

      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
  });
});
});
