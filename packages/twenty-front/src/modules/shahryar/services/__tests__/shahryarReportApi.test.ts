import {
  buildShahryarReportApiHeaders,
  createShahryarRecord,
  dispatchShahryarNotifications,
  fetchShahryarAdminWorkspaceMembers,
  fetchShahryarBackupStatus,
  fetchShahryarPendingNotifications,
  fetchShahryarRecordSections,
  resetShahryarWorkspaceMemberPassword,
} from '@/shahryar/services/shahryarReportApi';

jest.mock('@/apollo/utils/getTokenPair', () => ({
  getTokenPair: () => ({
    accessOrWorkspaceAgnosticToken: {
      token: 'workspace-token',
    },
  }),
}));

describe('shahryarReportApi', () => {
  it('builds authenticated REST headers when a workspace token is available', () => {
    expect(
      buildShahryarReportApiHeaders({
        accept: 'text/csv',
        contentType: 'application/json',
        token: 'workspace-token',
      }),
    ).toEqual({
      Accept: 'text/csv',
      'Content-Type': 'application/json',
      authorization: 'Bearer workspace-token',
    });
  });

  it('omits the authorization header when no token is available', () => {
    expect(
      buildShahryarReportApiHeaders({
        accept: 'application/json',
      }),
    ).toEqual({
      Accept: 'application/json',
    });
  });

  it('fetches Shahryar backup status from the REST API', async () => {
    const response = {
      status: 'healthy',
      label: 'Healthy',
      lastRunLabel: '2026-06-01 02:15 UTC',
      intervalHours: 24,
      dataSizeLabel: '1.8 GB',
      storageScopeLabel: 'Postgres + فایلە پەیوەندیدارەکان',
      operationModeLabel: 'Existing database backup operations',
    };
    const fetchMock = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => response,
    } as Response);
    const globalWithFetch = globalThis as typeof globalThis & {
      fetch?: typeof fetch;
    };

    Object.defineProperty(globalWithFetch, 'fetch', {
      configurable: true,
      value: fetchMock,
    });

    await expect(fetchShahryarBackupStatus()).resolves.toEqual(response);
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/shahryar/backups/status'),
      expect.objectContaining({
        headers: expect.objectContaining({
          authorization: 'Bearer workspace-token',
        }),
        method: 'GET',
      }),
    );

    Reflect.deleteProperty(globalWithFetch, 'fetch');
  });

  it('resets Shahryar workspace member passwords through the REST API', async () => {
    const response = {
      success: true,
      workspaceMemberId: '20202020-0687-4c41-b707-ed1bfca972a7',
      resetAt: '2026-06-01T10:00:00.000Z',
    };
    const fetchMock = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => response,
    } as Response);
    const globalWithFetch = globalThis as typeof globalThis & {
      fetch?: typeof fetch;
    };

    Object.defineProperty(globalWithFetch, 'fetch', {
      configurable: true,
      value: fetchMock,
    });

    await expect(
      resetShahryarWorkspaceMemberPassword({
        workspaceMemberId: '20202020-0687-4c41-b707-ed1bfca972a7',
        newPassword: 'new-password',
      }),
    ).resolves.toEqual(response);
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/shahryar/admin/password-reset'),
      expect.objectContaining({
        body: JSON.stringify({
          workspaceMemberId: '20202020-0687-4c41-b707-ed1bfca972a7',
          newPassword: 'new-password',
        }),
        headers: expect.objectContaining({
          authorization: 'Bearer workspace-token',
        }),
        method: 'POST',
      }),
    );

    Reflect.deleteProperty(globalWithFetch, 'fetch');
  });

  it('fetches admin workspace members for password reset selection', async () => {
    const response = [
      {
        id: '20202020-0687-4c41-b707-ed1bfca972a7',
        name: 'Karwan Supervisor',
        username: 'karwan',
        userEmail: 'karwan@example.test',
      },
    ];
    const fetchMock = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => response,
    } as Response);
    const globalWithFetch = globalThis as typeof globalThis & {
      fetch?: typeof fetch;
    };

    Object.defineProperty(globalWithFetch, 'fetch', {
      configurable: true,
      value: fetchMock,
    });

    await expect(fetchShahryarAdminWorkspaceMembers()).resolves.toEqual(
      response,
    );
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/shahryar/admin/workspace-members'),
      expect.objectContaining({
        headers: expect.objectContaining({
          authorization: 'Bearer workspace-token',
        }),
        method: 'GET',
      }),
    );

    Reflect.deleteProperty(globalWithFetch, 'fetch');
  });

  it('fetches Shahryar record sections from the REST API', async () => {
    const response = [
      {
        path: '/shahryar/markets',
        canCreate: false,
        rows: [['مارکێتی API']],
      },
    ];
    const fetchMock = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => response,
    } as Response);
    const globalWithFetch = globalThis as typeof globalThis & {
      fetch?: typeof fetch;
    };

    Object.defineProperty(globalWithFetch, 'fetch', {
      configurable: true,
      value: fetchMock,
    });

    await expect(fetchShahryarRecordSections()).resolves.toEqual(response);
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/shahryar/records/sections'),
      expect.objectContaining({
        headers: expect.objectContaining({
          authorization: 'Bearer workspace-token',
        }),
        method: 'GET',
      }),
    );

    Reflect.deleteProperty(globalWithFetch, 'fetch');
  });

  it('creates Shahryar records through the REST API', async () => {
    const response = {
      path: '/shahryar/markets',
      row: ['مارکێتی نوێ'],
      createdAt: '2026-06-01T10:00:00.000Z',
    };
    const fetchMock = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => response,
    } as Response);
    const globalWithFetch = globalThis as typeof globalThis & {
      fetch?: typeof fetch;
    };

    Object.defineProperty(globalWithFetch, 'fetch', {
      configurable: true,
      value: fetchMock,
    });

    await expect(
      createShahryarRecord({
        path: '/shahryar/markets',
        values: {
          name: 'مارکێتی نوێ',
        },
      }),
    ).resolves.toEqual(response);
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/shahryar/records'),
      expect.objectContaining({
        body: JSON.stringify({
          path: '/shahryar/markets',
          values: {
            name: 'مارکێتی نوێ',
          },
        }),
        headers: expect.objectContaining({
          authorization: 'Bearer workspace-token',
        }),
        method: 'POST',
      }),
    );

    Reflect.deleteProperty(globalWithFetch, 'fetch');
  });

  it('fetches pending mobile notification deliveries from the REST API', async () => {
    const response = [
      {
        id: 'missing-report-supervisor-1-device-record-1',
        notificationId: 'missing-report-supervisor-1',
        kind: 'missing-report',
        severity: 'warning',
        supervisorId: 'supervisor-1',
        supervisorName: 'Karwan',
        deviceId: 'ios-device-1',
        expoPushToken: 'ExponentPushToken[test]',
        title: 'ڕاپۆرت نەهات',
        body: 'Karwan has not submitted the daily report',
      },
    ];
    const fetchMock = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => response,
    } as Response);
    const globalWithFetch = globalThis as typeof globalThis & {
      fetch?: typeof fetch;
    };

    Object.defineProperty(globalWithFetch, 'fetch', {
      configurable: true,
      value: fetchMock,
    });

    await expect(fetchShahryarPendingNotifications()).resolves.toEqual(
      response,
    );
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/shahryar/notifications/pending'),
      expect.objectContaining({
        headers: expect.objectContaining({
          authorization: 'Bearer workspace-token',
        }),
        method: 'GET',
      }),
    );

    Reflect.deleteProperty(globalWithFetch, 'fetch');
  });

  it('dispatches pending mobile notifications through the REST API', async () => {
    const response = {
      attemptedCount: 2,
      sentCount: 1,
      failedCount: 1,
      failedDeliveryIds: ['missing-report-supervisor-1-device-record-2'],
    };
    const fetchMock = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => response,
    } as Response);
    const globalWithFetch = globalThis as typeof globalThis & {
      fetch?: typeof fetch;
    };

    Object.defineProperty(globalWithFetch, 'fetch', {
      configurable: true,
      value: fetchMock,
    });

    await expect(dispatchShahryarNotifications()).resolves.toEqual(response);
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/shahryar/notifications/dispatch'),
      expect.objectContaining({
        headers: expect.objectContaining({
          authorization: 'Bearer workspace-token',
        }),
        method: 'POST',
      }),
    );

    Reflect.deleteProperty(globalWithFetch, 'fetch');
  });
});
