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

// Every relation of the target has its other leg on another object: the thread,
// and each standard object a target leg points at. Selecting additions by owning
// object alone would provision half relations and fail validation.
const EXTERNAL_FIELD_UNIVERSAL_IDENTIFIERS = new Set([
  STANDARD_OBJECT_FIELDS.agentChatThread.recordTargets.universalIdentifier,
  STANDARD_OBJECT_FIELDS.person.agentChatThreadTargets.universalIdentifier,
  STANDARD_OBJECT_FIELDS.company.agentChatThreadTargets.universalIdentifier,
  STANDARD_OBJECT_FIELDS.opportunity.agentChatThreadTargets.universalIdentifier,
]);

export const getAgentChatThreadTargetSchemaAdditions = ({
  existing,
  standard,
}: {
  existing: AgentChatThreadTargetSchemaMaps;
  standard: AgentChatThreadTargetSchemaMaps;
}) => {
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
