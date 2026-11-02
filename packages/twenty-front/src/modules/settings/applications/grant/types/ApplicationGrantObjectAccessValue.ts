import { type GrantAccessLevel } from 'twenty-shared/application';

export type ApplicationGrantObjectAccessValue = {
  // null: the "all objects" request covers all objects, including future ones
  chosenObjectMetadataIds: string[] | null;
  addedObjects: { objectMetadataId: string; accessLevel: GrantAccessLevel }[];
};
