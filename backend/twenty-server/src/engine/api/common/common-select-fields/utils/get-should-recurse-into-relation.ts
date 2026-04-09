import { isDefined } from 'twenty-shared/utils';

import { MAX_DEPTH } from 'src/engine/api/rest/input-request-parsers/constants/max-depth.constant';
import { type Depth } from 'src/engine/api/rest/input-request-parsers/types/depth.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';

export const getShouldRecurseIntoRelation = ({
  depth,
  flatField,
}: {
  depth: Depth | undefined;
  flatField: FlatFieldMetadata;
}): boolean => {
  const flatFieldIsJoinColumn =
    isDefined(flatField.settings) &&
    'junctionTargetFieldId' in flatField.settings;

  // TODO: refactor this when we remove hard-coded activity relations
  const flatFieldIsActivityTarget =
    flatField.name === 'noteTargets' || flatField.name === 'taskTargets';

  const shouldGoOneLevelDeeper =
    depth === MAX_DEPTH && isDefined(flatField.relationTargetObjectMetadataId);

  const shouldRecurseIntoRelation =
    shouldGoOneLevelDeeper ||
    flatFieldIsActivityTarget ||
    flatFieldIsJoinColumn;

  return shouldRecurseIntoRelation;
};
