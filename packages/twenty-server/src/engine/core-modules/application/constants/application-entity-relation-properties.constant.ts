import { type ApplicationEntity } from 'src/engine/core-modules/application/application.entity';

export const APPLICATION_ENTITY_RELATION_PROPERTIES = [
  'workspace',
  'agents',
  'frontComponents',
  'commandMenuItems',
  'logicFunctions',
  'objects',
  'applicationVariables',
  'packageJsonFile',
  'yarnLockFile',
  'logoFile',
  'applicationRegistration',
  'primaryPublicDomain',
  'publicDomains',
] as const satisfies (keyof ApplicationEntity)[];
