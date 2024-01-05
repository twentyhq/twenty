import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';

export const getActivityTargetObjectFieldIdName = ({
  nameSingular,
}: {
  nameSingular: string;
}) => {
  const isCoreObject =
    nameSingular === CoreObjectNameSingular.Company ||
    nameSingular === CoreObjectNameSingular.Person;

  const objectFieldIdName = `${!isCoreObject ? '_' : ''}${nameSingular}Id`;

  return objectFieldIdName;
};
