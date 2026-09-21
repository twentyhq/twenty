import {
  STANDARD_OBJECT_FIELDS,
  STANDARD_OBJECTS,
} from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';

type AgentChatThreadTargetSchemaMaps = Pick<
  AllFlatEntityMaps,
  'flatObjectMetadataMaps' | 'flatFieldMetadataMaps' | 'flatIndexMaps'
>;

const OBJECT_UNIVERSAL_IDENTIFIER =
  STANDARD_OBJECTS.agentChatThreadTarget.universalIdentifier;

const THREAD_OBJECT_UNIVERSAL_IDENTIFIER =
  STANDARD_OBJECTS.agentChatThread.universalIdentifier;

// The relation's other leg lives on agentChatThread, so selecting additions by
// owning object alone would provision half a relation and fail validation.
const EXTERNAL_FIELD_UNIVERSAL_IDENTIFIERS = new Set([
  STANDARD_OBJECT_FIELDS.agentChatThread.recordTargets.universalIdentifier,
]);

const EMPTY_ADDITIONS = { objects: [], fields: [], indexes: [] };

export const getAgentChatThreadTargetSchemaAdditions = ({
  existing,
  standard,
}: {
  existing: AgentChatThreadTargetSchemaMaps;
  standard: AgentChatThreadTargetSchemaMaps;
}) => {
  // agentChatThread is provisioned by the agent history migration, which skips
  // a workspace that has no workspace schema. Both legs of the relation resolve
  // against it, so there is nothing to attach to until that command has run.
  if (
    !isDefined(
      existing.flatObjectMetadataMaps.byUniversalIdentifier[
        THREAD_OBJECT_UNIVERSAL_IDENTIFIER
      ],
    )
  ) {
    return EMPTY_ADDITIONS;
  }

  const objects = Object.values(
    standard.flatObjectMetadataMaps.byUniversalIdentifier,
  )
    .filter(isDefined)
    .filter(
      (object) =>
        object.universalIdentifier === OBJECT_UNIVERSAL_IDENTIFIER &&
        !isDefined(
          existing.flatObjectMetadataMaps.byUniversalIdentifier[
            object.universalIdentifier
          ],
        ),
    );

  const fields = Object.values(
    standard.flatFieldMetadataMaps.byUniversalIdentifier,
  )
    .filter(isDefined)
    .filter(
      (field) =>
        (field.objectMetadataUniversalIdentifier ===
          OBJECT_UNIVERSAL_IDENTIFIER ||
          EXTERNAL_FIELD_UNIVERSAL_IDENTIFIERS.has(
            field.universalIdentifier,
          )) &&
        !isDefined(
          existing.flatFieldMetadataMaps.byUniversalIdentifier[
            field.universalIdentifier
          ],
        ),
    );

  const indexes = Object.values(standard.flatIndexMaps.byUniversalIdentifier)
    .filter(isDefined)
    .filter(
      (index) =>
        index.objectMetadataUniversalIdentifier ===
          OBJECT_UNIVERSAL_IDENTIFIER &&
        !isDefined(
          existing.flatIndexMaps.byUniversalIdentifier[
            index.universalIdentifier
          ],
        ),
    );

  return { objects, fields, indexes };
};
