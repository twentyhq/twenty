import { expect, test, type APIResponse, type Page } from '@playwright/test';

import { getAccessAuthToken } from '../lib/utils/getAccessAuthToken';

type ShahryarAdminWorkspaceMember = {
  id: string;
  name: string;
  username: string;
  userEmail: string;
  isShahryarSupervisor: boolean;
};

type ShahryarAdminSupervisorOperationResponse = {
  success: boolean;
  workspaceMemberId: string;
  username: string;
  isShahryarSupervisor: boolean;
};

type ShahryarAdminPasswordResetResponse = {
  success: boolean;
  workspaceMemberId: string;
  resetAt: string;
};

type ShahryarAuthTokensResponse = {
  tokens: {
    accessOrWorkspaceAgnosticToken: {
      token: string;
    };
  };
};

type ShahryarReportRankedMetric = {
  id: string;
  label: string;
};

type ShahryarReportSummary = {
  analytics: {
    mostActiveSupervisors: ShahryarReportRankedMetric[];
  };
};

type ShahryarRecordSection = {
  path: string;
  canCreate: boolean;
  rows: string[][];
};

type ShahryarCreateRecordResponse = {
  id: string;
  path: string;
  row: string[];
  createdAt: string;
};

type ShahryarPhotoUploadResponse = {
  fileId: string;
  targetType: 'market' | 'visit';
  targetId: string;
  associatedAt: string;
  url: string;
};

type ShahryarMobileAssignedMarket = {
  id: string;
  name: string;
};

type ShahryarMobileSyncPullResponse = {
  currentSupervisorId?: string;
  assignedMarkets: ShahryarMobileAssignedMarket[];
  serverRecords: Array<{
    id: string;
    recordKind: 'visit' | 'working-time' | 'payment' | 'absence';
    updatedAt: string;
  }>;
};

type ShahryarMobileSyncResponse = {
  acceptedChanges: Array<{
    localId: string;
    recordKind: 'visit' | 'working-time' | 'payment' | 'absence';
  }>;
  conflicts: unknown[];
  rejectedChanges: unknown[];
};

type ShahryarNotificationDispatchResult = {
  attemptedCount: number;
  sentCount: number;
  failedCount: number;
};

type ShahryarNotificationDelivery = {
  id: string;
  status: 'pending' | 'sent' | 'failed';
};

const backendBaseUrl = process.env.BACKEND_BASE_URL ?? 'http://localhost:3000';
const frontendBaseUrl =
  process.env.FRONTEND_BASE_URL ?? 'http://localhost:3001';

const shahryarRestUrl = (path: string): string =>
  new URL(`/rest/shahryar${path}`, backendBaseUrl).toString();

const buildAuthHeaders = (authToken: string): Record<string, string> => ({
  Authorization: `Bearer ${authToken}`,
});

const expectOkResponse = async (response: APIResponse): Promise<void> => {
  expect(response.ok()).toBe(true);
};

const parseJsonResponse = async <TResponse>(
  response: APIResponse,
): Promise<TResponse> => (await response.json()) as TResponse;

const getJson = async <TResponse>({
  authToken,
  page,
  path,
}: {
  authToken: string;
  page: Page;
  path: string;
}): Promise<TResponse> => {
  const response = await page.request.get(shahryarRestUrl(path), {
    headers: buildAuthHeaders(authToken),
  });

  await expectOkResponse(response);

  return await parseJsonResponse<TResponse>(response);
};

const postJson = async <TResponse>({
  authToken,
  data,
  page,
  path,
}: {
  authToken: string;
  data: unknown;
  page: Page;
  path: string;
}): Promise<TResponse> => {
  const response = await page.request.post(shahryarRestUrl(path), {
    data,
    headers: buildAuthHeaders(authToken),
  });

  await expectOkResponse(response);

  return await parseJsonResponse<TResponse>(response);
};

const getAccessToken = async (page: Page): Promise<string> => {
  const { authToken } = await getAccessAuthToken(page);

  return authToken;
};

const getAcceptanceRunId = (): string =>
  Date.now()
    .toString(36)
    .replace(/[^a-z0-9]/g, '');

test.describe('Shahryar OPS acceptance', () => {
  test('admin manages supervisor access, resets password, and supervisor pulls scoped mobile data', async ({
    page,
  }) => {
    const authToken = await getAccessToken(page);
    const workspaceMembers = await getJson<ShahryarAdminWorkspaceMember[]>({
      authToken,
      page,
      path: '/admin/workspace-members',
    });
    const candidate = workspaceMembers.find(
      (workspaceMember) =>
        workspaceMember.userEmail !== process.env.DEFAULT_LOGIN &&
        !workspaceMember.isShahryarSupervisor &&
        workspaceMember.username.trim().length > 0,
    );

    if (candidate === undefined) {
      test.skip(
        true,
        'Shahryar supervisor lifecycle acceptance requires a non-default workspace member',
      );

      return;
    }

    const runId = getAcceptanceRunId();
    const username = `e2e-supervisor-${runId}`;
    const updatedUsername = `${username}-updated`;
    const newPassword = `Shahryar-${runId}-Password`;
    let shouldRemoveSupervisorAccess = false;

    try {
      const createdSupervisor =
        await postJson<ShahryarAdminSupervisorOperationResponse>({
          authToken,
          data: {
            workspaceMemberId: candidate.id,
            username,
          },
          page,
          path: '/admin/supervisors',
        });

      expect(createdSupervisor).toMatchObject({
        success: true,
        workspaceMemberId: candidate.id,
        username,
        isShahryarSupervisor: true,
      });
      shouldRemoveSupervisorAccess = true;

      const updatedSupervisor =
        await postJson<ShahryarAdminSupervisorOperationResponse>({
          authToken,
          data: {
            workspaceMemberId: candidate.id,
            username: updatedUsername,
          },
          page,
          path: '/admin/usernames',
        });

      expect(updatedSupervisor.username).toBe(updatedUsername);

      const passwordReset = await postJson<ShahryarAdminPasswordResetResponse>({
        authToken,
        data: {
          workspaceMemberId: candidate.id,
          newPassword,
        },
        page,
        path: '/admin/password-reset',
      });

      expect(passwordReset).toMatchObject({
        success: true,
        workspaceMemberId: candidate.id,
      });
      expect(passwordReset.resetAt).toEqual(expect.any(String));

      const mobileLoginResponse = await page.request.post(
        shahryarRestUrl('/mobile/auth/login'),
        {
          data: {
            username: updatedUsername,
            password: newPassword,
            origin: frontendBaseUrl,
          },
        },
      );

      await expectOkResponse(mobileLoginResponse);

      const mobileAuthTokens =
        await parseJsonResponse<ShahryarAuthTokensResponse>(
          mobileLoginResponse,
        );
      const supervisorMobilePull =
        await getJson<ShahryarMobileSyncPullResponse>({
          authToken:
            mobileAuthTokens.tokens.accessOrWorkspaceAgnosticToken.token,
          page,
          path: '/mobile/sync/pull',
        });

      expect(supervisorMobilePull.currentSupervisorId).toBe(candidate.id);
      expect(Array.isArray(supervisorMobilePull.assignedMarkets)).toBe(true);
    } finally {
      if (shouldRemoveSupervisorAccess) {
        const removedSupervisor =
          await postJson<ShahryarAdminSupervisorOperationResponse>({
            authToken,
            data: {
              workspaceMemberId: candidate.id,
            },
            page,
            path: '/admin/supervisors/remove',
          });

        expect(removedSupervisor.isShahryarSupervisor).toBe(false);

        await postJson<ShahryarAdminSupervisorOperationResponse>({
          authToken,
          data: {
            workspaceMemberId: candidate.id,
            username: candidate.username,
          },
          page,
          path: '/admin/usernames',
        });
      }
    }
  });

  test('supervisor visit, GPS photo association, and queued mobile records are accepted', async ({
    page,
  }) => {
    const authToken = await getAccessToken(page);
    const [summary, sections, mobilePull] = await Promise.all([
      getJson<ShahryarReportSummary>({
        authToken,
        page,
        path: '/reports/summary',
      }),
      getJson<ShahryarRecordSection[]>({
        authToken,
        page,
        path: '/records/sections',
      }),
      getJson<ShahryarMobileSyncPullResponse>({
        authToken,
        page,
        path: '/mobile/sync/pull',
      }),
    ]);
    const supervisor = summary.analytics.mostActiveSupervisors[0];
    const assignedMarket = mobilePull.assignedMarkets[0];
    const visitsSection = sections.find(
      (section) => section.path === '/shahryar/supervisor-visits',
    );

    if (
      supervisor === undefined ||
      assignedMarket === undefined ||
      visitsSection?.canCreate !== true
    ) {
      test.skip(
        true,
        'Shahryar visit acceptance requires a supervisor, an assigned market, and writable visit section',
      );

      return;
    }

    const runId = getAcceptanceRunId();
    const now = new Date().toISOString();
    const visit = await postJson<ShahryarCreateRecordResponse>({
      authToken,
      data: {
        path: '/shahryar/supervisor-visits',
        values: {
          supervisor: supervisor.label,
          market: assignedMarket.name,
          checkInAt: '09:30',
          gpsLocation: '36.191,44.009',
          soldCartons: '3',
          issue: `E2E GPS issue ${runId}`,
          decisionMaker: 'Store owner',
          requestDetails: 'Photo and GPS acceptance',
          report: 'Supervisor recorded visit with GPS and photo',
        },
      },
      page,
      path: '/records',
    });

    expect(visit.path).toBe('/shahryar/supervisor-visits');
    expect(visit.row).toContain('36.191,44.009');

    const photoUploadResponse = await page.request.post(
      shahryarRestUrl('/photos/uploads'),
      {
        headers: buildAuthHeaders(authToken),
        multipart: {
          targetType: 'visit',
          targetId: visit.id,
          localPhotoId: `e2e-photo-${runId}`,
          capturedAt: now,
          file: {
            name: `visit-${runId}.jpg`,
            mimeType: 'image/jpeg',
            buffer: Buffer.from([0xff, 0xd8, 0xff, 0xd9]),
          },
        },
      },
    );

    await expectOkResponse(photoUploadResponse);

    const uploadedPhoto =
      await parseJsonResponse<ShahryarPhotoUploadResponse>(photoUploadResponse);

    expect(uploadedPhoto).toMatchObject({
      targetType: 'visit',
      targetId: visit.id,
    });

    const mobileSyncResponse = await postJson<ShahryarMobileSyncResponse>({
      authToken,
      data: {
        deviceId: `e2e-mobile-${runId}`,
        changes: [
          {
            recordKind: 'visit',
            localId: `local-visit-${runId}`,
            operation: 'create',
            assignedMarketId: assignedMarket.id,
            supervisorId: supervisor.id,
            checkInAt: now,
            gpsLocation: {
              latitude: 36.191,
              longitude: 44.009,
            },
            photoFileIds: [uploadedPhoto.fileId],
            soldCartons: 2,
            requestedCartons: 1,
            issue: 'Offline visit accepted',
            decisionMaker: 'Store owner',
            requestDetails: 'Queued later sync',
            report: 'Mobile visit synced after offline entry',
            clientUpdatedAt: now,
          },
          {
            recordKind: 'working-time',
            localId: `local-working-time-${runId}`,
            operation: 'create',
            supervisorId: supervisor.id,
            workDate: now.slice(0, 10),
            checkInAt: now,
            gpsLocation: {
              latitude: 36.191,
              longitude: 44.009,
            },
            totalMinutes: 120,
            status: 'PRESENT',
            clientUpdatedAt: now,
          },
          {
            recordKind: 'payment',
            localId: `local-payment-${runId}`,
            operation: 'create',
            marketId: assignedMarket.id,
            collectedById: supervisor.id,
            amount: 50,
            paidAt: now.slice(0, 10),
            status: 'PARTIAL',
            notes: 'Offline payment accepted',
            clientUpdatedAt: now,
          },
          {
            recordKind: 'absence',
            localId: `local-absence-${runId}`,
            operation: 'create',
            supervisorId: supervisor.id,
            absenceDate: now.slice(0, 10),
            gpsLocation: {
              latitude: 36.191,
              longitude: 44.009,
            },
            reason: 'NO_WORK',
            notes: 'Offline absence accepted',
            clientUpdatedAt: now,
          },
        ],
      },
      page,
      path: '/mobile/sync',
    });

    expect(mobileSyncResponse.conflicts).toHaveLength(0);
    expect(mobileSyncResponse.rejectedChanges).toHaveLength(0);
    expect(
      mobileSyncResponse.acceptedChanges.map((change) => change.recordKind),
    ).toEqual(['visit', 'working-time', 'payment', 'absence']);
  });

  test('notifications dispatch with dedupe and reports export readable files', async ({
    page,
  }) => {
    const authToken = await getAccessToken(page);
    const firstDispatch = await postJson<ShahryarNotificationDispatchResult>({
      authToken,
      data: {},
      page,
      path: '/notifications/dispatch',
    });
    const secondDispatch = await postJson<ShahryarNotificationDispatchResult>({
      authToken,
      data: {},
      page,
      path: '/notifications/dispatch',
    });
    const deliveryLog = await getJson<ShahryarNotificationDelivery[]>({
      authToken,
      page,
      path: '/notifications/deliveries',
    });

    expect(firstDispatch.attemptedCount).toBeGreaterThanOrEqual(
      firstDispatch.sentCount + firstDispatch.failedCount,
    );
    expect(secondDispatch.sentCount).toBeLessThanOrEqual(
      firstDispatch.sentCount,
    );
    expect(Array.isArray(deliveryLog)).toBe(true);

    const excelResponse = await page.request.get(
      shahryarRestUrl('/reports/export.excel.xls'),
      {
        headers: buildAuthHeaders(authToken),
      },
    );
    const pdfResponse = await page.request.get(
      shahryarRestUrl('/reports/export.pdf'),
      {
        headers: buildAuthHeaders(authToken),
      },
    );

    await expectOkResponse(excelResponse);
    await expectOkResponse(pdfResponse);

    const excelBody = await excelResponse.text();
    const pdfBody = await pdfResponse.body();

    expect(excelBody).toContain('سەردان');
    expect(pdfBody.subarray(0, 4).toString()).toBe('%PDF');
    expect(pdfBody.length).toBeGreaterThan(100);
  });
});
