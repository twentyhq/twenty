import {
  getSystemRecordFormPageLayoutUniversalIdentifier,
  getSystemRecordPageLayoutUniversalIdentifier,
  type Manifest,
} from 'twenty-shared/application';
import { STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

const STANDARD_PAGE_LAYOUT_NAME_BY_UNIVERSAL_IDENTIFIER = new Map<
  string,
  string
>(
  Object.entries(STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS).map(
    ([name, { universalIdentifier }]) => [universalIdentifier, name] as const,
  ),
);

export const getPageLayoutNameForPullFile = ({
  pageLayoutUniversalIdentifier,
  manifest,
}: {
  pageLayoutUniversalIdentifier: string;
  manifest: Manifest;
}): string | null => {
  const pageLayoutManifest = manifest.pageLayouts?.find(
    (candidate) =>
      candidate.universalIdentifier === pageLayoutUniversalIdentifier,
  );

  if (isDefined(pageLayoutManifest)) {
    return pageLayoutManifest.name;
  }

  const standardPageLayoutName =
    STANDARD_PAGE_LAYOUT_NAME_BY_UNIVERSAL_IDENTIFIER.get(
      pageLayoutUniversalIdentifier,
    );

  if (isDefined(standardPageLayoutName)) {
    return standardPageLayoutName;
  }

  const objectMetadataApplicationUniversalIdentifier =
    manifest.application.universalIdentifier;

  for (const objectManifest of manifest.objects ?? []) {
    const systemPageLayoutUniversalIdentifiers = {
      objectMetadataApplicationUniversalIdentifier,
      objectUniversalIdentifier: objectManifest.universalIdentifier,
    };

    if (
      getSystemRecordPageLayoutUniversalIdentifier(
        systemPageLayoutUniversalIdentifiers,
      ) === pageLayoutUniversalIdentifier
    ) {
      return `${objectManifest.nameSingular}RecordPage`;
    }

    if (
      getSystemRecordFormPageLayoutUniversalIdentifier(
        systemPageLayoutUniversalIdentifiers,
      ) === pageLayoutUniversalIdentifier
    ) {
      return `${objectManifest.nameSingular}RecordForm`;
    }
  }

  return null;
};
