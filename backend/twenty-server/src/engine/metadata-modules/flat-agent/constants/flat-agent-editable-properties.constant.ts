import { type MetadataEntityPropertyName } from 'src/engine/metadata-modules/flat-entity/constant/all-entity-properties-configuration-by-metadata-name.constant';

export const FLAT_AGENT_EDITABLE_PROPERTIES = [
  'name',
  'label',
  'icon',
  'description',
  'prompt',
  'modelId',
  'responseFormat',
  'modelConfiguration',
  'evaluationInputs',
] as const satisfies MetadataEntityPropertyName<'agent'>[];
