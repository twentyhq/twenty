import { v5 } from 'uuid';

const UNIVERSAL_IDENTIFIER_NAMESPACE = '142046f0-4d80-48b5-ad56-26ad410e895c';

export const generateDefaultFieldUniversalIdentifier = ({
  objectUniversalIdentifier,
  fieldName,
}: {
  objectUniversalIdentifier: string;
  fieldName: string;
}) => {
  const seed = `${objectUniversalIdentifier}-${fieldName}`;

  return v5(seed, UNIVERSAL_IDENTIFIER_NAMESPACE);
};
