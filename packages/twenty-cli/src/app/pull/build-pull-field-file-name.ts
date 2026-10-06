import { toFileBaseName } from '@/app/pull/pull-file-base-name';

export const buildPullFieldFileName = ({
  objectName,
  fieldName,
  fieldUniversalIdentifier,
}: {
  objectName: string | null;
  fieldName: string;
  fieldUniversalIdentifier: string;
}): string =>
  toFileBaseName({
    segments: [objectName, fieldName],
    universalIdentifier: fieldUniversalIdentifier,
  });
