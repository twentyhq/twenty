import {
  SHAHRYAR_SUPERVISOR_VISIT_PHOTOS_FIELD_METADATA_UNIVERSAL_IDENTIFIER,
  type ShahryarMobileNotificationRegistrationRequest,
  type ShahryarMobileNotificationRegistrationResponse,
  type ShahryarMobilePhotoAssociationRequest,
  type ShahryarMobilePhotoAssociationResponse,
  type ShahryarMobileRecordSyncChange,
  type ShahryarMobileSyncQueueItem,
  type ShahryarMobileSyncPullResponse,
  type ShahryarMobileSyncRequest,
  type ShahryarMobileSyncResponse,
  type ShahryarMobileVisitSyncChange,
  type ShahryarMobileVisitSyncQueueItem,
} from 'twenty-shared/shahryar';

export type ShahryarMobileApiConfig = {
  apiBaseUrl: string;
  accessToken: string;
  deviceId: string;
};

export type ShahryarMobileSignInConfig = {
  apiBaseUrl: string;
  username: string;
  password: string;
  origin?: string;
};

type ShahryarFetchConfig = {
  apiBaseUrl: string;
  accessToken: string;
};

export type ShahryarMobilePhotoUploadResult = {
  localPhotoId: string;
  sourceUri: string;
  fileId: string;
  capturedAt: string;
};

type ShahryarMobileGraphQLResponse<TData> = {
  data?: TData;
  errors?: Array<{
    message?: string;
  }>;
};

type ShahryarMobileAuthTokensResponse = {
  tokens: {
    accessOrWorkspaceAgnosticToken: {
      token: string;
    };
  };
};

type ShahryarMobilePhotoFileUploadResponse = {
  uploadFilesFieldFileByUniversalIdentifier: {
    id: string;
  };
};

const UPLOAD_FILES_FIELD_FILE_BY_UNIVERSAL_IDENTIFIER = `
  mutation UploadFilesFieldFileByUniversalIdentifier(
    $file: Upload!
    $fieldMetadataUniversalIdentifier: String!
  ) {
    uploadFilesFieldFileByUniversalIdentifier(
      file: $file
      fieldMetadataUniversalIdentifier: $fieldMetadataUniversalIdentifier
    ) {
      id
    }
  }
`;

const isPendingQueueItem = (item: ShahryarMobileSyncQueueItem): boolean =>
  item.status === 'pending';

const isPendingVisitQueueItem = (
  item: ShahryarMobileSyncQueueItem,
): item is ShahryarMobileVisitSyncQueueItem =>
  item.status === 'pending' && item.recordKind === 'visit';

const getFileNameFromUri = (uri: string): string => {
  const path = uri.split('?')[0];
  const fileName = path.split('/').pop();

  return fileName === undefined || fileName.trim().length === 0
    ? 'visit-photo.jpg'
    : fileName;
};

export const buildVisitSyncChangeFromQueueItem = (
  item: ShahryarMobileVisitSyncQueueItem,
  photoFileIds: string[] = item.draft.photoFileIds,
): ShahryarMobileVisitSyncChange => ({
  recordKind: 'visit',
  localId: item.localId,
  serverId: item.draft.serverId,
  operation: item.draft.serverId === undefined ? 'create' : 'update',
  assignedMarketId: item.draft.assignedMarketId,
  supervisorId: item.draft.supervisorId,
  checkInAt: item.draft.checkInAt,
  gpsLocation: item.draft.gpsLocation,
  photoFileIds,
  soldCartons: item.draft.soldCartons,
  requestedCartons: item.draft.requestedCartons,
  issue: item.draft.issue,
  decisionMaker: item.draft.decisionMaker,
  requestDetails: item.draft.requestDetails,
  report: item.draft.report,
  baseServerUpdatedAt: item.lastSyncedAt,
  clientUpdatedAt: item.draft.updatedAt,
});

export const buildMobileRecordSyncChangeFromQueueItem = (
  item: ShahryarMobileSyncQueueItem,
  photoFileIds: string[] | undefined = undefined,
): ShahryarMobileRecordSyncChange => {
  if (item.recordKind === 'visit') {
    return buildVisitSyncChangeFromQueueItem(
      item,
      photoFileIds ?? item.draft.photoFileIds,
    );
  }

  if (item.recordKind === 'working-time') {
    return {
      recordKind: 'working-time',
      localId: item.localId,
      serverId: item.draft.serverId,
      operation: item.draft.serverId === undefined ? 'create' : 'update',
      supervisorId: item.draft.supervisorId,
      workDate: item.draft.workDate,
      checkInAt: item.draft.checkInAt,
      checkOutAt: item.draft.checkOutAt,
      gpsLocation: item.draft.gpsLocation,
      totalMinutes: item.draft.totalMinutes,
      status: item.draft.status,
      baseServerUpdatedAt: item.lastSyncedAt,
      clientUpdatedAt: item.draft.updatedAt,
    };
  }

  if (item.recordKind === 'payment') {
    return {
      recordKind: 'payment',
      localId: item.localId,
      serverId: item.draft.serverId,
      operation: item.draft.serverId === undefined ? 'create' : 'update',
      marketId: item.draft.marketId,
      collectedById: item.draft.collectedById,
      amount: item.draft.amount,
      dueDate: item.draft.dueDate,
      paidAt: item.draft.paidAt,
      status: item.draft.status,
      notes: item.draft.notes,
      baseServerUpdatedAt: item.lastSyncedAt,
      clientUpdatedAt: item.draft.updatedAt,
    };
  }

  return {
    recordKind: 'absence',
    localId: item.localId,
    serverId: item.draft.serverId,
    operation: item.draft.serverId === undefined ? 'create' : 'update',
    supervisorId: item.draft.supervisorId,
    absenceDate: item.draft.absenceDate,
    workingTime: item.draft.workingTime,
    gpsLocation: item.draft.gpsLocation,
    reason: item.draft.reason,
    notes: item.draft.notes,
    baseServerUpdatedAt: item.lastSyncedAt,
    clientUpdatedAt: item.draft.updatedAt,
  };
};

export const buildMobileSyncRequest = ({
  deviceId,
  photoFileIdsByLocalId = new Map<string, string[]>(),
  queue,
}: {
  deviceId: string;
  photoFileIdsByLocalId?: Map<string, string[]>;
  queue: ShahryarMobileSyncQueueItem[];
}): ShahryarMobileSyncRequest => ({
  deviceId,
  changes: queue.filter(isPendingQueueItem).map((item) => {
    const photoFileIds =
      item.recordKind === 'visit'
        ? (photoFileIdsByLocalId.get(item.localId) ?? item.draft.photoFileIds)
        : undefined;

    return buildMobileRecordSyncChangeFromQueueItem(item, photoFileIds);
  }),
});

export const signInShahryarMobile = async ({
  apiBaseUrl,
  origin = apiBaseUrl,
  password,
  username,
}: ShahryarMobileSignInConfig): Promise<string> => {
  const response = await fetch(
    `${apiBaseUrl}/rest/shahryar/mobile/auth/login`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        origin,
        password,
        username,
      }),
    },
  );

  if (!response.ok) {
    throw new Error(`Shahryar mobile sign in failed with ${response.status}`);
  }

  const authTokenData =
    (await response.json()) as ShahryarMobileAuthTokensResponse;

  return authTokenData.tokens.accessOrWorkspaceAgnosticToken.token;
};

const buildGraphQLUploadFormData = ({
  fieldMetadataUniversalIdentifier,
  file,
  fileName,
}: {
  fieldMetadataUniversalIdentifier: string;
  file: Blob;
  fileName: string;
}): FormData => {
  const formData = new FormData();

  formData.append(
    'operations',
    JSON.stringify({
      query: UPLOAD_FILES_FIELD_FILE_BY_UNIVERSAL_IDENTIFIER,
      variables: {
        file: null,
        fieldMetadataUniversalIdentifier,
      },
    }),
  );
  formData.append(
    'map',
    JSON.stringify({
      0: ['variables.file'],
    }),
  );
  formData.append('0', file, fileName);

  return formData;
};

export const uploadShahryarMobilePhoto = async ({
  accessToken,
  apiBaseUrl,
  capturedAt,
  fieldMetadataUniversalIdentifier = SHAHRYAR_SUPERVISOR_VISIT_PHOTOS_FIELD_METADATA_UNIVERSAL_IDENTIFIER,
  sourceUri,
}: ShahryarFetchConfig & {
  capturedAt: string;
  fieldMetadataUniversalIdentifier?: string;
  sourceUri: string;
}): Promise<ShahryarMobilePhotoUploadResult> => {
  const photoResponse = await fetch(sourceUri);

  if (!photoResponse.ok) {
    throw new Error(
      `Shahryar mobile photo read failed with ${photoResponse.status}`,
    );
  }

  const response = await fetch(`${apiBaseUrl}/graphql`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: buildGraphQLUploadFormData({
      fieldMetadataUniversalIdentifier,
      file: await photoResponse.blob(),
      fileName: getFileNameFromUri(sourceUri),
    }),
  });

  if (!response.ok) {
    throw new Error(
      `Shahryar mobile photo upload failed with ${response.status}`,
    );
  }

  const result =
    (await response.json()) as ShahryarMobileGraphQLResponse<ShahryarMobilePhotoFileUploadResponse>;

  if (result.data === undefined || (result.errors?.length ?? 0) > 0) {
    throw new Error('Shahryar mobile photo upload returned errors');
  }

  return {
    localPhotoId: sourceUri,
    sourceUri,
    fileId: result.data.uploadFilesFieldFileByUniversalIdentifier.id,
    capturedAt,
  };
};

const uploadPendingVisitPhotos = async ({
  accessToken,
  apiBaseUrl,
  queue,
}: ShahryarFetchConfig & {
  queue: ShahryarMobileSyncQueueItem[];
}): Promise<Map<string, ShahryarMobilePhotoUploadResult[]>> => {
  const uploadResultsByLocalId = new Map<
    string,
    ShahryarMobilePhotoUploadResult[]
  >();

  for (const item of queue.filter(isPendingVisitQueueItem)) {
    const uploadResults = item.draft.photoFileIds.map((fileId) => ({
      localPhotoId: fileId,
      sourceUri: fileId,
      fileId,
      capturedAt: item.draft.checkInAt,
    }));

    for (const sourceUri of item.draft.photoLocalUris) {
      uploadResults.push(
        await uploadShahryarMobilePhoto({
          accessToken,
          apiBaseUrl,
          capturedAt: item.draft.checkInAt,
          sourceUri,
        }),
      );
    }

    uploadResultsByLocalId.set(item.localId, uploadResults);
  }

  return uploadResultsByLocalId;
};

const associateAcceptedVisitPhotos = async ({
  accessToken,
  apiBaseUrl,
  photoUploadsByLocalId,
  response,
}: ShahryarFetchConfig & {
  photoUploadsByLocalId: Map<string, ShahryarMobilePhotoUploadResult[]>;
  response: ShahryarMobileSyncResponse;
}): Promise<void> => {
  for (const acceptedChange of response.acceptedChanges) {
    if (acceptedChange.serverId === undefined) {
      continue;
    }

    const photoUploads =
      photoUploadsByLocalId.get(acceptedChange.localId) ?? [];

    for (const photoUpload of photoUploads) {
      await associateShahryarMobilePhoto({
        accessToken,
        apiBaseUrl,
        request: {
          localPhotoId: photoUpload.localPhotoId,
          fileId: photoUpload.fileId,
          targetType: 'visit',
          targetId: acceptedChange.serverId,
          capturedAt: photoUpload.capturedAt,
        },
      });
    }
  }
};

export const syncOfflineVisitQueue = async ({
  apiBaseUrl,
  accessToken,
  deviceId,
  queue,
}: ShahryarMobileApiConfig & {
  queue: ShahryarMobileSyncQueueItem[];
}): Promise<ShahryarMobileSyncResponse> => {
  const photoUploadsByLocalId = await uploadPendingVisitPhotos({
    accessToken,
    apiBaseUrl,
    queue,
  });
  const photoFileIdsByLocalId = new Map(
    Array.from(photoUploadsByLocalId.entries()).map(([localId, uploads]) => [
      localId,
      uploads.map((upload) => upload.fileId),
    ]),
  );

  const response = await fetch(`${apiBaseUrl}/rest/shahryar/mobile/sync`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(
      buildMobileSyncRequest({ deviceId, photoFileIdsByLocalId, queue }),
    ),
  });

  if (!response.ok) {
    throw new Error(`Shahryar mobile sync failed with ${response.status}`);
  }

  const syncResponse = (await response.json()) as ShahryarMobileSyncResponse;

  await associateAcceptedVisitPhotos({
    accessToken,
    apiBaseUrl,
    photoUploadsByLocalId,
    response: syncResponse,
  });

  return syncResponse;
};

export const pullShahryarMobileSyncData = async ({
  apiBaseUrl,
  accessToken,
}: ShahryarFetchConfig): Promise<ShahryarMobileSyncPullResponse> => {
  const response = await fetch(`${apiBaseUrl}/rest/shahryar/mobile/sync/pull`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Shahryar mobile pull failed with ${response.status}`);
  }

  return (await response.json()) as ShahryarMobileSyncPullResponse;
};

export const associateShahryarMobilePhoto = async ({
  apiBaseUrl,
  accessToken,
  request,
}: ShahryarFetchConfig & {
  request: ShahryarMobilePhotoAssociationRequest;
}): Promise<ShahryarMobilePhotoAssociationResponse> => {
  const response = await fetch(
    `${apiBaseUrl}/rest/shahryar/mobile/photo-associations`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    },
  );

  if (!response.ok) {
    throw new Error(
      `Shahryar mobile photo association failed with ${response.status}`,
    );
  }

  return (await response.json()) as ShahryarMobilePhotoAssociationResponse;
};

export const registerShahryarMobileNotifications = async ({
  apiBaseUrl,
  accessToken,
  request,
}: ShahryarFetchConfig & {
  request: ShahryarMobileNotificationRegistrationRequest;
}): Promise<ShahryarMobileNotificationRegistrationResponse> => {
  const response = await fetch(
    `${apiBaseUrl}/rest/shahryar/mobile/notifications/register`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    },
  );

  if (!response.ok) {
    throw new Error(
      `Shahryar mobile notification registration failed with ${response.status}`,
    );
  }

  return (await response.json()) as ShahryarMobileNotificationRegistrationResponse;
};
