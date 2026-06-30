import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createMulticaIssueHandler } from 'src/logic-functions/handlers/create-multica-issue-handler';
import { updateMulticaIssueHandler } from 'src/logic-functions/handlers/update-multica-issue-handler';
import type { MulticaIssue } from 'src/logic-functions/types/multica.types';

const WORKSPACE_ID = 'd11337e4-0c4e-43b8-8fc8-8216c70f1427';
const PROJECT_ID = 'fb2e3c0e-27e0-47ac-b86d-3d2e18832fd6';

const makeIssue = (overrides: Partial<MulticaIssue> = {}): MulticaIssue => ({
  id: 'issue-1',
  workspace_id: WORKSPACE_ID,
  number: 82,
  identifier: 'X0-82',
  title: 'Support ticket',
  description: null,
  status: 'todo',
  priority: 'medium',
  assignee_type: null,
  assignee_id: null,
  creator_type: 'member',
  creator_id: 'creator-1',
  parent_issue_id: null,
  project_id: PROJECT_ID,
  position: -1,
  start_date: null,
  due_date: null,
  created_at: '2026-06-30T00:00:00Z',
  updated_at: '2026-06-30T00:00:00Z',
  metadata: {},
  labels: [],
  ...overrides,
});

const stubFetch = (issue = makeIssue()) => {
  const fetchMock = vi.fn(async () => ({
    ok: true,
    json: async () => issue,
    text: async () => '',
  })) as unknown as typeof fetch & { mock: { calls: unknown[][] } };

  vi.stubGlobal('fetch', fetchMock);

  return fetchMock;
};

beforeEach(() => {
  delete process.env.MULTICA_API_KEY;
  vi.unstubAllGlobals();
});

afterEach(() => {
  delete process.env.MULTICA_API_KEY;
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('createMulticaIssueHandler', () => {
  it('requires a Multica API key before creating an issue', async () => {
    const fetchMock = stubFetch();

    const result = await createMulticaIssueHandler({ title: 'New issue' });

    expect(result).toEqual({
      success: false,
      error: 'Missing MULTICA_API_KEY environment variable.',
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('requires a non-empty title', async () => {
    process.env.MULTICA_API_KEY = 'pat-test';
    const fetchMock = stubFetch();

    const result = await createMulticaIssueHandler({ title: '   ' });

    expect(result).toEqual({ success: false, error: '`title` is required.' });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('creates issues in the existing XO Support project', async () => {
    process.env.MULTICA_API_KEY = 'pat-test';
    const issue = makeIssue({ id: 'issue-created', identifier: 'X0-83' });
    const fetchMock = stubFetch(issue);

    const result = await createMulticaIssueHandler({
      title: 'Refund question',
      description: 'Customer needs help',
      priority: 'high',
      status: 'todo',
      due_date: '2026-07-01',
    });

    expect(result).toEqual({ success: true, issue });
    expect(fetchMock).toHaveBeenCalledWith(
      `https://api.multica.ai/api/issues?workspace_id=${WORKSPACE_ID}`,
      expect.objectContaining({ method: 'POST' }),
    );

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(init.headers).toEqual({
      Authorization: 'Bearer pat-test',
      'Content-Type': 'application/json',
    });
    expect(JSON.parse(init.body as string)).toEqual({
      title: 'Refund question',
      description: 'Customer needs help',
      priority: 'high',
      status: 'todo',
      project_id: PROJECT_ID,
      due_date: '2026-07-01',
      metadata: {
        source: 'twenty-multica-tickets',
        app_version: '0.1.0',
        created_via: 'api',
      },
    });
  });
});

describe('updateMulticaIssueHandler', () => {
  it('requires a Multica issue id', async () => {
    process.env.MULTICA_API_KEY = 'pat-test';
    const fetchMock = stubFetch();

    const result = await updateMulticaIssueHandler({ multicaIssueId: '   ' });

    expect(result).toEqual({
      success: false,
      error: '`multicaIssueId` is required.',
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('skips outward updates immediately after webhook sync', async () => {
    process.env.MULTICA_API_KEY = 'pat-test';
    const fetchMock = stubFetch();

    const result = await updateMulticaIssueHandler({
      multicaIssueId: 'issue-1',
      lastSyncedFromMulticaAt: new Date().toISOString(),
      status: 'RESOLVED',
    });

    expect(result).toEqual({
      success: false,
      error: 'Skipped — record was just synced from Multica (loop guard).',
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('normalizes Twenty status and priority values before updating Multica', async () => {
    process.env.MULTICA_API_KEY = 'pat-test';
    const issue = makeIssue({ status: 'done', priority: 'urgent' });
    const fetchMock = stubFetch(issue);

    const result = await updateMulticaIssueHandler({
      multicaIssueId: 'issue/with slash',
      status: 'RESOLVED',
      priority: 'URGENT',
      title: 'Resolved ticket',
    });

    expect(result).toEqual({ success: true, issue });
    expect(fetchMock).toHaveBeenCalledWith(
      `https://api.multica.ai/api/issues/issue%2Fwith%20slash?workspace_id=${WORKSPACE_ID}`,
      expect.objectContaining({ method: 'PUT' }),
    );

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(JSON.parse(init.body as string)).toEqual({
      title: 'Resolved ticket',
      priority: 'urgent',
      status: 'done',
    });
  });
});
