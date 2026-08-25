import { CoreObjectNameSingular } from 'twenty-shared/types';

export type TargetFieldName =
  | 'targetPersonId'
  | 'targetCompanyId'
  | 'targetOpportunityId';

export const getTargetFieldNameForObjectRecord = (
  objectNameSingular: string,
): TargetFieldName | null => {
  switch (objectNameSingular) {
    case CoreObjectNameSingular.Person:
      return 'targetPersonId';
    case CoreObjectNameSingular.Company:
      return 'targetCompanyId';
    case CoreObjectNameSingular.Opportunity:
      return 'targetOpportunityId';
    default:
      return null;
  }
};
