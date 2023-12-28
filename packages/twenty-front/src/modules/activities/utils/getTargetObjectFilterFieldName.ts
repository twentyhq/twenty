import { ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';

export const getTargetableObjectFilterFieldName = ({
  targetableObject,
}: {
  targetableObject: ActivityTargetableObject;
}) => {
  const isCoreObject =
    targetableObject.targetObjectNameSingular ===
      CoreObjectNameSingular.Company ||
    targetableObject.targetObjectNameSingular === CoreObjectNameSingular.Person;

  const targetableObjectFieldName = `${!isCoreObject ? '_' : ''}${
    targetableObject.targetObjectNameSingular
  }Id`;

  return targetableObjectFieldName;
};
