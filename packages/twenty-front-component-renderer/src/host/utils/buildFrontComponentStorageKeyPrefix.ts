import { type FrontComponentStorageNamespace } from '@/types/FrontComponentStorageNamespace';

export const buildFrontComponentStorageKeyPrefix = ({
  applicationId,
  userId,
}: FrontComponentStorageNamespace): string =>
  `frontComponentStorage:${applicationId}:${userId}:`;
