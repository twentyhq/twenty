import { STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS } from 'twenty-sdk/define';

// taskTargets / noteTargets are morph relations: the create input exposes one
// `target<Object>Id` field per linkable object. Binding a workflow input to an
// object's universalIdentifier makes the builder render a record picker scoped
// to that object.
export type TargetObject = {
  name: string;
  label: string;
  objectUniversalIdentifier: string;
  targetFieldName: string;
};

export const TARGET_OBJECTS = {
  person: {
    name: 'person',
    label: 'Person',
    objectUniversalIdentifier:
      STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.universalIdentifier,
    targetFieldName: 'targetPersonId',
  },
  company: {
    name: 'company',
    label: 'Company',
    objectUniversalIdentifier:
      STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.company.universalIdentifier,
    targetFieldName: 'targetCompanyId',
  },
  opportunity: {
    name: 'opportunity',
    label: 'Opportunity',
    objectUniversalIdentifier:
      STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.universalIdentifier,
    targetFieldName: 'targetOpportunityId',
  },
} satisfies Record<string, TargetObject>;
