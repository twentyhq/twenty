import { type ApplicationEntityRelationProperties } from 'src/engine/core-modules/application/types/application-entity-relation-properties.type';

export const APPLICATION_LIST_RELATION_PROPERTIES = [
  'agents',
  'frontComponents',
  'commandMenuItems',
  'settingsMenuItems',
  'logicFunctions',
  'objects',
  'applicationVariables',
] as const satisfies ApplicationEntityRelationProperties[];
