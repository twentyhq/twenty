import { type FrontComponentLocalStorageNamespace } from '@/types/FrontComponentLocalStorageNamespace';

export const buildFrontComponentLocalStorageNamespace = ({
  applicationId,
  userId,
}: FrontComponentLocalStorageNamespace): string => `${applicationId}:${userId}`;
