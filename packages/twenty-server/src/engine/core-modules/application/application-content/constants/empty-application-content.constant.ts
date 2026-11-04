import { type ApplicationContentDTO } from 'src/engine/core-modules/application/application-content/dtos/application-content.dto';

export const EMPTY_APPLICATION_CONTENT: ApplicationContentDTO = {
  objects: [],
  fields: [],
  indexes: [],
  views: [],
  viewFields: [],
  pageLayouts: [],
  pageLayoutTabs: [],
  navigationMenuItems: [],
  commandMenuItems: [],
  frontComponents: [],
  workflows: [],
  logicFunctions: [],
  agents: [],
  skills: [],
  roles: [],
  permissionFlags: [],
  connectionProviders: [],
  publicAssets: [],
  translations: [],
};
