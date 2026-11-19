import {
  type ObjectManifest,
  type StandaloneViewFieldManifest,
  SYSTEM_VIEW_KEYS,
  type ViewManifest,
  getSystemViewUniversalIdentifier,
} from 'twenty-shared/application';

export const partitionStandaloneViewFieldManifests = ({
  manifest,
  applicationUniversalIdentifier,
}: {
  manifest: {
    objects?: Pick<ObjectManifest, 'universalIdentifier'>[];
    views?: Pick<ViewManifest, 'universalIdentifier'>[];
    viewFields?: StandaloneViewFieldManifest[];
  };
  applicationUniversalIdentifier: string;
}): {
  ownViewFieldManifests: StandaloneViewFieldManifest[];
  suggestedViewFieldManifests: StandaloneViewFieldManifest[];
} => {
  // The engine creates the system views of the app's own objects, so the manifest never lists them.
  const ownSystemViewUniversalIdentifiers = (manifest.objects ?? []).flatMap(
    ({ universalIdentifier: objectUniversalIdentifier }) =>
      Object.values(SYSTEM_VIEW_KEYS).map((viewKey) =>
        getSystemViewUniversalIdentifier({
          objectMetadataApplicationUniversalIdentifier:
            applicationUniversalIdentifier,
          objectUniversalIdentifier,
          viewKey,
        }),
      ),
  );

  const ownViewUniversalIdentifiers = new Set([
    ...(manifest.views ?? []).map(
      ({ universalIdentifier }) => universalIdentifier,
    ),
    ...ownSystemViewUniversalIdentifiers,
  ]);

  const ownViewFieldManifests: StandaloneViewFieldManifest[] = [];
  const suggestedViewFieldManifests: StandaloneViewFieldManifest[] = [];

  for (const viewFieldManifest of manifest.viewFields ?? []) {
    if (
      ownViewUniversalIdentifiers.has(viewFieldManifest.viewUniversalIdentifier)
    ) {
      ownViewFieldManifests.push(viewFieldManifest);
    } else {
      suggestedViewFieldManifests.push(viewFieldManifest);
    }
  }

  return { ownViewFieldManifests, suggestedViewFieldManifests };
};
