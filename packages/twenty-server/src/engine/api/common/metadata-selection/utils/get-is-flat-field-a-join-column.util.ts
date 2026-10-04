import { isDefined } from 'twenty-shared/utils';

import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';

export const getIsFlatFieldAJoinColumn = ({
  flatField,
}: {
  flatField: FlatFieldMetadata;
}): boolean => {
  const flatFieldIsJoinColumn =
    isDefined(flatField.settings) &&
    'junctionTargetFieldId' in flatField.settings;

  // TODO: refactor this when we remove hard-coded activity relations
  const flatFieldIsActivityTarget =
    flatField.name === 'noteTargets' || flatField.name === 'taskTargets';

  return flatFieldIsJoinColumn || flatFieldIsActivityTarget;
};
