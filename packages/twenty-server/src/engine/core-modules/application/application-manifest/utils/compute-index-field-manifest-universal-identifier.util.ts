import { v5 as uuidv5 } from 'uuid';

export const computeIndexFieldManifestUniversalIdentifier = ({
  indexUniversalIdentifier,
  fieldMetadataUniversalIdentifier,
  subFieldName,
}: {
  indexUniversalIdentifier: string;
  fieldMetadataUniversalIdentifier: string;
  subFieldName: string | null | undefined;
}): string =>
  uuidv5(
    `${fieldMetadataUniversalIdentifier}:${subFieldName ?? ''}`,
    indexUniversalIdentifier,
  );
