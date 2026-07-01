import { type Manifest } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

export type ManifestEntityDescriptor = {
  entityKind: string;
  label: string;
};

// Maps a universalIdentifier back to the human-readable entity it refers to in
// the manifest, so an installation failure deep in the flat-entity maps can be
// surfaced as "the object 'Invoice'" rather than an opaque UUID.
export const findManifestEntityDescriptorByUniversalIdentifier = ({
  manifest,
  universalIdentifier,
}: {
  manifest: Manifest;
  universalIdentifier: string;
}): ManifestEntityDescriptor | undefined => {
  const matchingObject = manifest.objects.find(
    (object) => object.universalIdentifier === universalIdentifier,
  );

  if (isDefined(matchingObject)) {
    return { entityKind: 'object', label: matchingObject.labelSingular };
  }

  const matchingField = manifest.fields.find(
    (field) => field.universalIdentifier === universalIdentifier,
  );

  if (isDefined(matchingField)) {
    return { entityKind: 'field', label: matchingField.label };
  }

  return undefined;
};
