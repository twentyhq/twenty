import { StandardObjectNameSingular } from '@/object-metadata/types/StandardObjectNameSingular';

export const isStandardObject = (objectNameSingular: string) => {
  const standardObjectNames = [
    StandardObjectNameSingular.Company,
    StandardObjectNameSingular.Person,
    StandardObjectNameSingular.Opportunity,
  ];

  if (standardObjectNames.includes(objectNameSingular as any)) {
    return true;
  }

  return false;
};
