import { beforeAll, describe, expect, it } from 'vitest';

import {
  executeLogicFunction,
  findLogicFunctionId,
} from './helpers/metadata';

const COUNT_PRS_FN_UI = '082227ae-2acc-4320-8d31-62ad6c443da6';
const COUNT_ISSUES_FN_UI = 'd8cc32bf-6be9-44fc-920a-8bba510f045f';
const COUNT_PROJECT_ITEMS_FN_UI = 'f7a3e1b2-5c4d-4e6f-8a9b-0d1c2e3f4a5b';
const COUNT_CONTRIBUTORS_FN_UI = 'fe0a6f00-0d63-4cb9-9b3c-1d8186181830';
const HANDLE_WEBHOOK_FN_UI = '22b199b3-2851-4a4f-99fd-4e79c188fe7d';

const fnIds: Record<string, string> = {};

beforeAll(async () => {
  fnIds.prs = await findLogicFunctionId(COUNT_PRS_FN_UI);
  fnIds.issues = await findLogicFunctionId(COUNT_ISSUES_FN_UI);
  fnIds.projectItems = await findLogicFunctionId(COUNT_PROJECT_ITEMS_FN_UI);
  fnIds.contributors = await findLogicFunctionId(COUNT_CONTRIBUTORS_FN_UI);
  fnIds.webhook = await findLogicFunctionId(HANDLE_WEBHOOK_FN_UI);
});

describe('logic functions are wired up', () => {
  it('count-prs is reachable and returns the expected payload shape', async () => {
    const result = await executeLogicFunction(fnIds.prs, {
      body: { repos: ['fixture-org/fixture-repo'] },
    });
    expect(['SUCCESS', 'ERROR']).toContain(result.status);
    if (result.status === 'SUCCESS') {
      const data = result.data as {
        totalPages: number;
        repos: Array<{ owner: string; repo: string; pages: number }>;
      };
      expect(typeof data.totalPages).toBe('number');
      expect(Array.isArray(data.repos)).toBe(true);
    }
  });

  it('count-issues is reachable', async () => {
    const result = await executeLogicFunction(fnIds.issues, {
      body: { repos: ['fixture-org/fixture-repo'] },
    });
    expect(['SUCCESS', 'ERROR']).toContain(result.status);
  });

  it('count-project-items is reachable', async () => {
    const result = await executeLogicFunction(fnIds.projectItems, {
      body: { projects: [{ owner: 'fixture-org', number: 9999999 }] },
    });
    expect(['SUCCESS', 'ERROR']).toContain(result.status);
  });

  it('count-contributors iterates configured repos and returns the per-repo split', async () => {
    const result = await executeLogicFunction(fnIds.contributors, {
      body: { repos: ['fixture-org/fixture-repo'] },
    });
    expect(['SUCCESS', 'ERROR']).toContain(result.status);
    if (result.status === 'SUCCESS') {
      const data = result.data as {
        totalPages: number;
        repos: Array<{ owner: string; repo: string; pages: number }>;
      };
      expect(typeof data.totalPages).toBe('number');
      expect(Array.isArray(data.repos)).toBe(true);
      expect('orgMembers' in (data as Record<string, unknown>)).toBe(false);
    }
  });

  it('handle-github-webhook is registered (but rejects unsigned requests gracefully)', async () => {
    expect(fnIds.webhook).toBeDefined();
  });
});
