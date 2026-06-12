// taskTargets / noteTargets are morph relations: the create input field is
// named `target<Object>Id` (e.g. targetPersonId, targetCompanyId,
// targetOpportunityId, or target<CustomObject>Id). We build it from the
// singular object name so the tools work with any object, standard or custom.
export const buildTargetFieldName = (targetObject: string): string => {
  const normalized = targetObject.trim();
  const pascalCased = `${normalized.charAt(0).toUpperCase()}${normalized.slice(1)}`;

  return `target${pascalCased}Id`;
};
