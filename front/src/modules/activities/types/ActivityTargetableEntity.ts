export type ActivityTargetableEntityType = 'Person' | 'Company';

export type ActivityTargetableEntity = {
  id: string;
  type: ActivityTargetableEntityType;
  relatedEntities?: ActivityTargetableEntity[];
};
