import { type EachTestingContext } from 'twenty-shared/testing';

import { main, type FirefliesWebhookPayload, type ProcessResult } from '../../serverlessFunctions/receive-fireflies-notes/src/index';

type FirefliesWebhookTestCase = EachTestingContext<{
  payload: FirefliesWebhookPayload;
  expected: Partial<ProcessResult>;
  description: string;
}>;

const testCases: FirefliesWebhookTestCase[] = [
  {
    title: 'one-on-one meeting creates notes',
    context: {
      description: 'Two participants should create individual notes',
      payload: {
        id: 'test-1on1-001',
        title: 'Weekly 1:1 with Manager',
        start_time: '2024-11-02T14:00:00Z',
        duration: 1800,
        transcript_url: 'https://app.fireflies.ai/transcript/1on1-001',
        recording_url: 'https://app.fireflies.ai/recording/1on1-001',
        summary: 'Discussed quarterly goals and performance review.',
        transcript: 'Manager: How are you feeling about the current projects?',
        participants: [
          { email: 'manager@company.com', name: 'Sarah Manager' },
          { email: 'employee@company.com', name: 'John Employee' }
        ],
        organizer_email: 'manager@company.com',
        webhook_secret: 'testsecret'
      },
      expected: {
        success: true,
        noteIds: expect.any(Array),
        newContacts: expect.any(Array)
      }
    }
  },
  {
    title: 'team meeting creates meeting record',
    context: {
      description: 'Multiple participants should create meeting record',
      payload: {
        id: 'test-team-002',
        title: 'Sprint Planning Meeting',
        start_time: '2024-11-02T15:00:00Z',
        duration: 3600,
        transcript_url: 'https://app.fireflies.ai/transcript/team-002',
        summary: 'Planned upcoming sprint, assigned tickets.',
        transcript: 'Scrum Master: Let\'s review the backlog items...',
        participants: [
          { email: 'scrum@company.com', name: 'Alice Scrum' },
          { email: 'dev1@company.com', name: 'Bob Developer' },
          { email: 'dev2@company.com', name: 'Carol Coder' }
        ],
        organizer_email: 'scrum@company.com',
        webhook_secret: 'testsecret'
      },
      expected: {
        success: true,
        meetingId: expect.any(String),
        newContacts: expect.any(Array)
      }
    }
  },
  {
    title: 'invalid webhook secret is rejected',
    context: {
      description: 'Invalid webhook secret should be rejected',
      payload: {
        id: 'test-security-005',
        title: 'Security Test Meeting',
        start_time: '2024-11-02T17:00:00Z',
        duration: 900,
        transcript_url: 'https://app.fireflies.ai/transcript/security-005',
        summary: 'This should be rejected.',
        transcript: 'Test transcript',
        participants: [
          { email: 'test@example.com', name: 'Test User' }
        ],
        organizer_email: 'test@example.com',
        webhook_secret: 'wrongsecret'
      },
      expected: {
        success: false,
        errors: ['Invalid webhook secret']
      }
    }
  }
];

// Mock environment variables
const originalEnv = process.env;

beforeEach(() => {
  process.env = {
    ...originalEnv,
    FIREFLIES_WEBHOOK_SECRET: 'testsecret',
    AUTO_CREATE_CONTACTS: 'true',
    SERVER_URL: 'http://localhost:3000',
    TWENTY_API_KEY: 'test-api-key'
  };
});

afterEach(() => {
  process.env = originalEnv;
});

describe('fireflies-webhook', () => {
  test.each(testCases)('$title', async ({ context: { payload, expected, description } }) => {
    // Mock fetch for GraphQL calls
    global.fetch = jest.fn().mockImplementation((url, options) => {
      const body = JSON.parse(options?.body as string);

      // Mock different GraphQL responses based on query
      if (body.query.includes('FindMeeting')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ data: { meetings: { edges: [] } } })
        });
      }

      if (body.query.includes('FindPeople')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ data: { people: { edges: [] } } })
        });
      }

      if (body.query.includes('createPerson')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ data: { createPerson: { id: 'new-person-id' } } })
        });
      }

      if (body.query.includes('createNote')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ data: { createNote: { id: 'new-note-id' } } })
        });
      }

      if (body.query.includes('createMeeting')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ data: { createMeeting: { id: 'new-meeting-id' } } })
        });
      }

      return Promise.resolve({
        ok: false,
        status: 400,
        json: () => Promise.resolve({ errors: [{ message: 'Mocked error' }] })
      });
    });

    const result = await main(payload);

    expect(result.success).toBe(expected.success);

    if (expected.success) {
      if (expected.noteIds) {
        expect(result.noteIds).toBeDefined();
        expect(Array.isArray(result.noteIds)).toBe(true);
      }

      if (expected.meetingId) {
        expect(result.meetingId).toBeDefined();
        expect(typeof result.meetingId).toBe('string');
      }

      if (expected.newContacts) {
        expect(result.newContacts).toBeDefined();
        expect(Array.isArray(result.newContacts)).toBe(true);
      }
    } else {
      expect(result.errors).toEqual(expected.errors);
    }
  });

  test('should handle missing payload', async () => {
    const result = await main(null as any);

    expect(result.success).toBe(false);
    expect(result.errors).toContain('Missing webhook payload');
  });

  test('should handle GraphQL errors', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 400
    });

    const payload: FirefliesWebhookPayload = {
      id: 'test-error',
      title: 'Error Test',
      start_time: '2024-11-02T12:00:00Z',
      duration: 900,
      transcript_url: 'https://app.fireflies.ai/transcript/error',
      summary: 'Test error handling',
      transcript: 'Test transcript',
      participants: [{ email: 'test@example.com', name: 'Test User' }],
      organizer_email: 'test@example.com',
      webhook_secret: 'testsecret'
    };

    const result = await main(payload);

    expect(result.success).toBe(false);
    expect(result.errors).toBeDefined();
  });
});