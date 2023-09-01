export enum ActivityTargetableEntityType {
  Person = 'Person',
  Company = 'Company',
}

export type ActivityTargetableEntity = {
  id: string;
  type: ActivityTargetableEntityType;
  relatedEntities?: ActivityTargetableEntity[];
};
