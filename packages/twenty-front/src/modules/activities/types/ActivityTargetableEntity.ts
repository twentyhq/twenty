export type ActivityTargetableEntityType = 'Person' | 'Company' | 'Custom';

export type ActivityTargetableEntity = {
  id: string;
  type: ActivityTargetableEntityType;
  relatedEntities?: ActivityTargetableEntity[];
};
