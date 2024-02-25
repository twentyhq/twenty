export type ActivityTargetableObject = {
  id: string;
  targetObjectNameSingular: string;
  relatedTargetableObjects?: ActivityTargetableObject[];
};
