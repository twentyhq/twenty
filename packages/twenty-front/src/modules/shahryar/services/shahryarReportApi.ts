import { REST_API_BASE_URL } from '@/apollo/constant/rest-api-base-url';
import { getTokenPair } from '@/apollo/utils/getTokenPair';
import {
  type ShahryarAdminPasswordResetRequest,
  type ShahryarAdminPasswordResetResponse,
  type ShahryarAdminWorkspaceMember,
} from '@/shahryar/types/shahryarAdminApi';
import { type ShahryarBackupApiStatusResponse } from '@/shahryar/types/shahryarBackupApi';
import {
  type ShahryarCreateRecordRequest,
  type ShahryarCreateRecordResponse,
  type ShahryarRecordApiSection,
} from '@/shahryar/types/shahryarRecordApi';
import {
  type ShahryarNotificationDelivery,
  type ShahryarNotificationDispatchResult,
} from '@/shahryar/types/shahryarNotificationApi';
import { type ShahryarReportApiSummary } from '@/shahryar/types/shahryarReportApi';
import { saveAs } from 'file-saver';

type BuildShahryarReportApiHeadersOptions = {
  accept: string;
  contentType?: string;
  token?: string;
};

export class ShahryarReportApiError extends Error {
  constructor({ action, response }: { action: string; response: Response }) {
    super(`${action} failed: ${response.status} ${response.statusText}`);
    this.name = 'ShahryarReportApiError';
  }
}

export const buildShahryarReportApiHeaders = ({
  accept,
  contentType,
  token,
}: BuildShahryarReportApiHeadersOptions): Record<string, string> => ({
  Accept: accept,
  ...(contentType !== undefined && { 'Content-Type': contentType }),
  ...(token !== undefined &&
    token.trim().length > 0 && { authorization: `Bearer ${token}` }),
});

const getAccessToken = () =>
  getTokenPair()?.accessOrWorkspaceAgnosticToken?.token;

export const fetchShahryarReportSummary = async ({
  signal,
}: {
  signal?: AbortSignal;
} = {}): Promise<ShahryarReportApiSummary> => {
  const response = await fetch(
    `${REST_API_BASE_URL}/shahryar/reports/summary`,
    {
      method: 'GET',
      headers: buildShahryarReportApiHeaders({
        accept: 'application/json',
        token: getAccessToken(),
      }),
      signal,
    },
  );

  if (!response.ok) {
    throw new ShahryarReportApiError({
      action: 'Fetch Shahryar report summary',
      response,
    });
  }

  return await response.json();
};

export const fetchShahryarBackupStatus = async ({
  signal,
}: {
  signal?: AbortSignal;
} = {}): Promise<ShahryarBackupApiStatusResponse> => {
  const response = await fetch(`${REST_API_BASE_URL}/shahryar/backups/status`, {
    method: 'GET',
    headers: buildShahryarReportApiHeaders({
      accept: 'application/json',
      token: getAccessToken(),
    }),
    signal,
  });

  if (!response.ok) {
    throw new ShahryarReportApiError({
      action: 'Fetch Shahryar backup status',
      response,
    });
  }

  return await response.json();
};

export const fetchShahryarAdminWorkspaceMembers = async ({
  signal,
}: {
  signal?: AbortSignal;
} = {}): Promise<ShahryarAdminWorkspaceMember[]> => {
  const response = await fetch(
    `${REST_API_BASE_URL}/shahryar/admin/workspace-members`,
    {
      method: 'GET',
      headers: buildShahryarReportApiHeaders({
        accept: 'application/json',
        token: getAccessToken(),
      }),
      signal,
    },
  );

  if (!response.ok) {
    throw new ShahryarReportApiError({
      action: 'Fetch Shahryar admin workspace members',
      response,
    });
  }

  return await response.json();
};

export const fetchShahryarRecordSections = async ({
  signal,
}: {
  signal?: AbortSignal;
} = {}): Promise<ShahryarRecordApiSection[]> => {
  const response = await fetch(
    `${REST_API_BASE_URL}/shahryar/records/sections`,
    {
      method: 'GET',
      headers: buildShahryarReportApiHeaders({
        accept: 'application/json',
        token: getAccessToken(),
      }),
      signal,
    },
  );

  if (!response.ok) {
    throw new ShahryarReportApiError({
      action: 'Fetch Shahryar record sections',
      response,
    });
  }

  return await response.json();
};

export const createShahryarRecord = async ({
  path,
  values,
}: ShahryarCreateRecordRequest): Promise<ShahryarCreateRecordResponse> => {
  const response = await fetch(`${REST_API_BASE_URL}/shahryar/records`, {
    method: 'POST',
    headers: buildShahryarReportApiHeaders({
      accept: 'application/json',
      contentType: 'application/json',
      token: getAccessToken(),
    }),
    body: JSON.stringify({
      path,
      values,
    }),
  });

  if (!response.ok) {
    throw new ShahryarReportApiError({
      action: 'Create Shahryar record',
      response,
    });
  }

  return await response.json();
};

export const fetchShahryarPendingNotifications = async ({
  signal,
}: {
  signal?: AbortSignal;
} = {}): Promise<ShahryarNotificationDelivery[]> => {
  const response = await fetch(
    `${REST_API_BASE_URL}/shahryar/notifications/pending`,
    {
      method: 'GET',
      headers: buildShahryarReportApiHeaders({
        accept: 'application/json',
        token: getAccessToken(),
      }),
      signal,
    },
  );

  if (!response.ok) {
    throw new ShahryarReportApiError({
      action: 'Fetch Shahryar pending notifications',
      response,
    });
  }

  return await response.json();
};

export const dispatchShahryarNotifications =
  async (): Promise<ShahryarNotificationDispatchResult> => {
    const response = await fetch(
      `${REST_API_BASE_URL}/shahryar/notifications/dispatch`,
      {
        method: 'POST',
        headers: buildShahryarReportApiHeaders({
          accept: 'application/json',
          contentType: 'application/json',
          token: getAccessToken(),
        }),
      },
    );

    if (!response.ok) {
      throw new ShahryarReportApiError({
        action: 'Dispatch Shahryar notifications',
        response,
      });
    }

    return await response.json();
  };

export const resetShahryarWorkspaceMemberPassword = async ({
  newPassword,
  workspaceMemberId,
}: ShahryarAdminPasswordResetRequest): Promise<ShahryarAdminPasswordResetResponse> => {
  const response = await fetch(
    `${REST_API_BASE_URL}/shahryar/admin/password-reset`,
    {
      method: 'POST',
      headers: buildShahryarReportApiHeaders({
        accept: 'application/json',
        contentType: 'application/json',
        token: getAccessToken(),
      }),
      body: JSON.stringify({
        workspaceMemberId,
        newPassword,
      }),
    },
  );

  if (!response.ok) {
    throw new ShahryarReportApiError({
      action: 'Reset Shahryar workspace member password',
      response,
    });
  }

  return await response.json();
};

const downloadShahryarReportFile = async ({
  accept,
  action,
  fileName,
  path,
}: {
  accept: string;
  action: string;
  fileName: string;
  path: string;
}) => {
  const response = await fetch(
    `${REST_API_BASE_URL}/shahryar/reports/${path}`,
    {
      method: 'GET',
      headers: buildShahryarReportApiHeaders({
        accept,
        token: getAccessToken(),
      }),
    },
  );

  if (!response.ok) {
    throw new ShahryarReportApiError({
      action,
      response,
    });
  }

  saveAs(await response.blob(), fileName);
};

export const downloadShahryarReportCsv = async () =>
  downloadShahryarReportFile({
    accept: 'text/csv',
    action: 'Download Shahryar report CSV',
    fileName: 'shahryar-report.csv',
    path: 'export.csv',
  });

export const downloadShahryarReportExcel = async () =>
  downloadShahryarReportFile({
    accept: 'application/vnd.ms-excel',
    action: 'Download Shahryar report Excel',
    fileName: 'shahryar-report.xls',
    path: 'export.excel.xls',
  });

export const downloadShahryarReportPdf = async () =>
  downloadShahryarReportFile({
    accept: 'application/pdf',
    action: 'Download Shahryar report PDF',
    fileName: 'shahryar-report.pdf',
    path: 'export.pdf',
  });
