import { type RoutePayload } from 'twenty-sdk/define';
import { beforeEach, expect, it, vi } from 'vitest';
import { desktopCompanionHandler } from 'src/logic-functions/desktop-companion';

const { clients, agenda } = vi.hoisted(() => ({
  clients: vi.fn(),
  agenda: vi.fn(),
}));
vi.mock('twenty-client-sdk/core', () => ({
  CoreApiClient: class {
    constructor(options: unknown) {
      clients(options);
    }
  },
}));
vi.mock('src/logic-functions/flows/get-desktop-companion-agenda.util', () => ({
  getDesktopCompanionAgenda: agenda,
}));
beforeEach(() => vi.clearAllMocks());
const payload = (userWorkspaceId: string | null): RoutePayload<unknown> =>
  ({ userWorkspaceId, body: { action: 'agenda' } }) as RoutePayload<unknown>;
it('rejects unauthenticated and application-only requests before reading calendars', async () => {
  await expect(desktopCompanionHandler(payload(null))).rejects.toThrow(
    'Sign in',
  );
  expect(clients).not.toHaveBeenCalled();
  expect(agenda).not.toHaveBeenCalled();
});
it('uses the authenticated user context for their personal agenda', async () => {
  agenda.mockResolvedValue({ meetings: [] });
  expect(await desktopCompanionHandler(payload('user-workspace-1'))).toEqual({
    meetings: [],
  });
  expect(clients).toHaveBeenCalledWith({ runAs: 'user' });
  expect(agenda).toHaveBeenCalledWith(expect.anything(), 'user-workspace-1');
});
