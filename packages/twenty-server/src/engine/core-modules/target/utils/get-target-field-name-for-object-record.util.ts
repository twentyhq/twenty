import { StandardObjectNameSingular } from 'twenty-shared/types';

export type TargetFieldName =
  | 'targetPersonId'
  | 'targetCompanyId'
  | 'targetOpportunityId';

export type TargetFilter = {
  fieldName: TargetFieldName;
  recordId: string;
};

export const getTargetFieldNameForObjectRecord = (
  objectNameSingular: string,
): TargetFieldName | null => {
  switch (objectNameSingular) {
    case StandardObjectNameSingular.Person:
      return 'targetPersonId';
    case StandardObjectNameSingular.Company:
      return 'targetCompanyId';
    case StandardObjectNameSingular.Opportunity:
      return 'targetOpportunityId';
    default:
      return null;
  }
};
