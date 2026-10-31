import { type ObjectPermissionAction } from 'twenty-shared/application';

// null objectUniversalIdentifiers keeps the "all objects" switch on, so it also covers future objects
export type ApplicationGrantObjectScope = {
  action: ObjectPermissionAction;
  objectUniversalIdentifiers: string[] | null;
};
