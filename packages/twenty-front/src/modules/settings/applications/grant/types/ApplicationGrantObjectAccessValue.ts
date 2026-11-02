import { type GrantAccessLevel } from 'twenty-shared/application';

export type ApplicationGrantObjectAccessValue = {
  // Whether the "all objects" request keeps covering every object, including future ones
  coversAllObjects: boolean;
  objects: { objectMetadataId: string; accessLevel: GrantAccessLevel }[];
};
