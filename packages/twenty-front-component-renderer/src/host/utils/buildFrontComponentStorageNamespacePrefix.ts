import { type FrontComponentStorageNamespace } from '@/types/FrontComponentStorageNamespace';

export const buildFrontComponentStorageNamespacePrefix = ({
  applicationId,
  userId,
}: FrontComponentStorageNamespace): string =>
  `frontComponentStorage:${applicationId}:${userId}:`;
