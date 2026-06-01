import {
  SHAHRYAR_SUPERVISOR_VISIT_PHOTOS_FIELD_METADATA_UNIVERSAL_IDENTIFIER,
  type ShahryarMobileNotificationRegistrationRequest,
  type ShahryarMobileNotificationRegistrationResponse,
  type ShahryarMobilePhotoAssociationRequest,
  type ShahryarMobilePhotoAssociationResponse,
  type ShahryarMobileSyncQueueItem,
  type ShahryarMobileSyncPullResponse,
  type ShahryarMobileSyncRequest,
  type ShahryarMobileSyncResponse,
  type ShahryarMobileVisitSyncChange,
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

type ShahryarMobileGraphQLVariables = Record<string, unknown>;

type ShahryarMobileLoginTokenResponse = {
  getLoginTokenFromCredentials: {
    loginToken: {
      token: string;
    };
  };
};

type ShahryarMobileAuthTokensResponse = {
  getAuthTokensFromLoginToken: {
    tokens: {
      accessOrWorkspaceAgnosticToken: {
        token: string;
      };
    };
  };
};

type ShahryarMobilePhotoFileUploadResponse = {
  uploadFilesFieldFileByUniversalIdentifier: {
    id: string;
  };
};

const GET_LOGIN_TOKEN_FROM_CREDENTIALS = `
  mutation GetLoginTokenFromCredentials(
    $email: String!
    $password: String!
    $origin: String!
  ) {
    getLoginTokenFromCredentials(
      email: $email
      password: $password
      origin: $origin
    ) {
      loginToken {
        token
      }
    }
  }
`;

const GET_AUTH_TOKENS_FROM_LOGIN_TOKEN = `
  mutation GetAuthTokensFromLoginToken($loginToken: String!, $origin: String!) {
    getAuthTokensFromLoginToken(loginToken: $loginToken, origin: $origin) {
      tokens {
        accessOrWorkspaceAgnosticToken {
          token
        }
      }
    }
  }
`;

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

const getFileNameFromUri = (uri: string): string => {
  const path = uri.split('?')[0];
  const fileName = path.split('/').pop();

  return fileName === undefined || fileName.trim().length === 0
    ? 'visit-photo.jpg'
    : fileName;
};

export const buildVisitSyncChangeFromQueueItem = (
  item: ShahryarMobileSyncQueueItem,
  photoFileIds: string[] = item.draft.photoFileIds,
): ShahryarMobileVisitSyncChange => ({
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
  changes: queue
    .filter(isPendingQueueItem)
    .map((item) =>
      buildVisitSyncChangeFromQueueItem(
        item,
        photoFileIdsByLocalId.get(item.localId) ?? item.draft.photoFileIds,
      ),
    ),
});

const postShahryarMobileGraphQL = async <TData>({
  apiBaseUrl,
  query,
  variables,
}: {
  apiBaseUrl: string;
  query: string;
  variables: ShahryarMobileGraphQLVariables;
}): Promise<TData> => {
  const response = await fetch(`${apiBaseUrl}/graphql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query,
      variables,
    }),
  });

  if (!response.ok) {
    throw new Error(`Shahryar mobile GraphQL failed with ${response.status}`);
  }

  const result =
    (await response.json()) as ShahryarMobileGraphQLResponse<TData>;

  if (result.data === undefined || (result.errors?.length ?? 0) > 0) {
    throw new Error('Shahryar mobile GraphQL returned errors');
  }

  return result.data;
};

export const signInShahryarMobile = async ({
  apiBaseUrl,
  origin = apiBaseUrl,
  password,
  username,
}: ShahryarMobileSignInConfig): Promise<string> => {
  const loginTokenData =
    await postShahryarMobileGraphQL<ShahryarMobileLoginTokenResponse>({
      apiBaseUrl,
      query: GET_LOGIN_TOKEN_FROM_CREDENTIALS,
      variables: {
        email: username,
        password,
        origin,
      },
    });

  const authTokenData =
    await postShahryarMobileGraphQL<ShahryarMobileAuthTokensResponse>({
      apiBaseUrl,
      query: GET_AUTH_TOKENS_FROM_LOGIN_TOKEN,
      variables: {
        loginToken:
          loginTokenData.getLoginTokenFromCredentials.loginToken.token,
        origin,
      },
    });

  return authTokenData.getAuthTokensFromLoginToken.tokens
    .accessOrWorkspaceAgnosticToken.token;
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

  for (const item of queue.filter(isPendingQueueItem)) {
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
