export const buildFrontComponentStorageNamespace = ({
  applicationId,
  userId,
}: {
  applicationId: string;
  userId: string;
}): string => `frontComponentStorage:${applicationId}:${userId}:`;
