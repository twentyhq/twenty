import { type ApplicationEntity } from 'src/engine/core-modules/application/application.entity';

export const APPLICATION_ENTITY_RELATION_PROPERTIES = [
  'workspace',
  'agents',
  'logicFunctions',
  'objects',
  'applicationVariables',
] as const satisfies (keyof ApplicationEntity)[];
