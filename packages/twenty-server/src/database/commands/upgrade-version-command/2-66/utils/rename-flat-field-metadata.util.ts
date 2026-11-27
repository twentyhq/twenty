import { isManyToOneFlatFieldMetadata } from 'src/database/commands/upgrade-version-command/2-66/utils/is-many-to-one-flat-field-metadata.util';
import { computeMorphOrRelationFieldJoinColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-morph-or-relation-field-join-column-name.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';

export const renameFlatFieldMetadata = ({
  flatFieldMetadata,
  name,
  now,
}: {
  flatFieldMetadata: FlatFieldMetadata;
  name: string;
  now: string;
}): FlatFieldMetadata => {
  if (!isManyToOneFlatFieldMetadata(flatFieldMetadata)) {
    return { ...flatFieldMetadata, name, updatedAt: now };
  }

  return {
    ...flatFieldMetadata,
    name,
    universalSettings: {
      ...flatFieldMetadata.universalSettings,
      joinColumnName: computeMorphOrRelationFieldJoinColumnName({ name }),
    },
    updatedAt: now,
  };
};
