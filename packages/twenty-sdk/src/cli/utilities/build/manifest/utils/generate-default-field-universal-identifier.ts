import type { ObjectConfig } from '@/sdk/objects/object-config';
import { v5 } from 'uuid';

const UNIVERSAL_IDENTIFIER_NAMESPACE = '142046f0-4d80-48b5-ad56-26ad410e895c';

export const generateDefaultFieldUniversalIdentifier = ({
  objectConfig,
  fieldName,
}: {
  objectConfig: ObjectConfig;
  fieldName: string;
}) => {
  const seed = `${objectConfig.universalIdentifier}-${fieldName}`;

  return v5(seed, UNIVERSAL_IDENTIFIER_NAMESPACE);
};
