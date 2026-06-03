import {
  buildShahryarReportApiHeaders,
  createShahryarSupervisor,
  createShahryarRecord,
  dispatchShahryarNotifications,
  fetchShahryarAdminWorkspaceMembers,
  fetchShahryarBackupStatus,
  fetchShahryarNotificationDeliveries,
  fetchShahryarPendingNotifications,
  fetchShahryarRecordSections,
  removeShahryarSupervisor,
  resetShahryarWorkspaceMemberPassword,
  updateShahryarWorkspaceMemberUsername,
  uploadShahryarRecordPhoto,
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
      lastSuccessfulBackupAt: '2026-06-01T02:15:00.000Z',
      lastSuccessfulBackupLabel: '2026-06-01 02:15 UTC',
      nextScheduledBackupAt: '2026-06-02T02:15:00.000Z',
      nextScheduledBackupLabel: '2026-06-02 02:15 UTC',
      intervalHours: 24,
      dataSizeLabel: '1.8 GB',
      storageScopeLabel: 'Postgres + فایلە پەیوەندیدارەکان',
      operationModeLabel: 'Existing database backup operations',
      manualExport: {
        isAvailable: false,
        label:
          'Manual backup export is not supported by the current platform backup integration',
      },
      history: [
        {
          id: 'seed-backup-success-2026-06-01T02:15:00.000Z',
          status: 'healthy',
          label: 'Seed backup status',
          completedAt: '2026-06-01T02:15:00.000Z',
          completedAtLabel: '2026-06-01 02:15 UTC',
          dataSizeLabel: '1.8 GB',
          storageScopeLabel: 'Postgres + فایلە پەیوەندیدارەکان',
        },
      ],
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
        isShahryarSupervisor: true,
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

  it('creates Shahryar supervisors through the REST API', async () => {
    const response = {
      success: true,
      workspaceMemberId: '20202020-0687-4c41-b707-ed1bfca972a7',
      username: 'karwan',
      isShahryarSupervisor: true,
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
      createShahryarSupervisor({
        workspaceMemberId: '20202020-0687-4c41-b707-ed1bfca972a7',
        username: 'karwan',
      }),
    ).resolves.toEqual(response);
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/shahryar/admin/supervisors'),
      expect.objectContaining({
        body: JSON.stringify({
          workspaceMemberId: '20202020-0687-4c41-b707-ed1bfca972a7',
          username: 'karwan',
        }),
        headers: expect.objectContaining({
          authorization: 'Bearer workspace-token',
        }),
        method: 'POST',
      }),
    );

    Reflect.deleteProperty(globalWithFetch, 'fetch');
  });

  it('updates Shahryar usernames through the REST API', async () => {
    const response = {
      success: true,
      workspaceMemberId: '20202020-0687-4c41-b707-ed1bfca972a7',
      username: 'karwan-updated',
      isShahryarSupervisor: true,
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
      updateShahryarWorkspaceMemberUsername({
        workspaceMemberId: '20202020-0687-4c41-b707-ed1bfca972a7',
        username: 'karwan-updated',
      }),
    ).resolves.toEqual(response);
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/shahryar/admin/usernames'),
      expect.objectContaining({
        body: JSON.stringify({
          workspaceMemberId: '20202020-0687-4c41-b707-ed1bfca972a7',
          username: 'karwan-updated',
        }),
        headers: expect.objectContaining({
          authorization: 'Bearer workspace-token',
        }),
        method: 'POST',
      }),
    );

    Reflect.deleteProperty(globalWithFetch, 'fetch');
  });

  it('removes Shahryar supervisor access through the REST API', async () => {
    const response = {
      success: true,
      workspaceMemberId: '20202020-0687-4c41-b707-ed1bfca972a7',
      username: 'karwan',
      isShahryarSupervisor: false,
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
      removeShahryarSupervisor({
        workspaceMemberId: '20202020-0687-4c41-b707-ed1bfca972a7',
      }),
    ).resolves.toEqual(response);
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/shahryar/admin/supervisors/remove'),
      expect.objectContaining({
        body: JSON.stringify({
          workspaceMemberId: '20202020-0687-4c41-b707-ed1bfca972a7',
        }),
        headers: expect.objectContaining({
          authorization: 'Bearer workspace-token',
        }),
        method: 'POST',
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
      id: '20202020-0101-4000-8000-000000000004',
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

  it('uploads Shahryar record photos through multipart REST', async () => {
    const file = new File(['photo-bytes'], 'shop.jpg', {
      type: 'image/jpeg',
    });
    const response = {
      fileId: '20202020-0101-4000-8000-000000000005',
      filename: 'shop.jpg',
      targetType: 'market',
      targetId: '20202020-0101-4000-8000-000000000004',
      associatedAt: '2026-06-01T10:01:00.000Z',
      url: 'https://files.example.test/shop.jpg',
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
      uploadShahryarRecordPhoto({
        capturedAt: '2026-06-01T10:00:00.000Z',
        file,
        targetId: '20202020-0101-4000-8000-000000000004',
        targetType: 'market',
      }),
    ).resolves.toEqual(response);

    const requestInit = fetchMock.mock.calls[0]?.[1] as RequestInit;

    const formData = requestInit.body;

    if (!(formData instanceof FormData)) {
      throw new Error('Expected multipart FormData body');
    }

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/shahryar/photos/uploads'),
      expect.objectContaining({
        headers: expect.objectContaining({
          authorization: 'Bearer workspace-token',
        }),
        method: 'POST',
      }),
    );
    expect(requestInit.headers).not.toMatchObject({
      'Content-Type': expect.any(String),
    });
    expect(formData.get('file')).toBe(file);
    expect(formData.get('targetType')).toBe('market');
    expect(formData.get('targetId')).toBe(
      '20202020-0101-4000-8000-000000000004',
    );
    expect(formData.get('localPhotoId')).toBe('shop.jpg');

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
        status: 'pending',
        attemptCount: 0,
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

  it('fetches mobile notification delivery audit rows from the REST API', async () => {
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
        status: 'failed',
        attemptCount: 1,
        lastAttemptAt: '2026-06-01T17:00:00.000Z',
        failureReason: 'Expo push ticket failed',
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

    await expect(
      fetchShahryarNotificationDeliveries({ status: 'failed' }),
    ).resolves.toEqual(response);
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining(
        '/shahryar/notifications/deliveries?status=failed',
      ),
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
