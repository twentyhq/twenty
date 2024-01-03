import { StandardObjectNameSingular } from '@/object-metadata/types/StandardObjectNameSingular';

export const isStandardObject = (objectNameSingular: string) => {
  const standardObjectNames = [
    StandardObjectNameSingular.Company,
    StandardObjectNameSingular.Person,
    StandardObjectNameSingular.Opportunity,
  ] as string[];

  return standardObjectNames.includes(objectNameSingular);
};
