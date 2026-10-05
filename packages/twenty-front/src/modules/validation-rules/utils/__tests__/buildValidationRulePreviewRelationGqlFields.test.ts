import {
  FieldMetadataType,
  RelationType,
  type ValidationRuleFieldDescriptor,
} from 'twenty-shared/types';

import { buildValidationRulePreviewRelationGqlFields } from '@/validation-rules/utils/buildValidationRulePreviewRelationGqlFields';

const COMPANY_FIELDS: ValidationRuleFieldDescriptor[] = [
  {
    name: 'name',
    type: FieldMetadataType.TEXT,
    universalIdentifier: 'company-name',
  },
  {
    name: 'employees',
    type: FieldMetadataType.NUMBER,
    universalIdentifier: 'company-employees',
  },
];

const FIELDS: ValidationRuleFieldDescriptor[] = [
  {
    name: 'stage',
    type: FieldMetadataType.SELECT,
    universalIdentifier: 'opportunity-stage',
  },
  {
    name: 'company',
    type: FieldMetadataType.RELATION,
    universalIdentifier: 'opportunity-company',
    relationType: RelationType.MANY_TO_ONE,
    relationTargetFields: COMPANY_FIELDS,
  },
  {
    name: 'pointOfContact',
    type: FieldMetadataType.RELATION,
    universalIdentifier: 'opportunity-point-of-contact',
    relationType: RelationType.MANY_TO_ONE,
    relationTargetFields: [
      {
        name: 'city',
        type: FieldMetadataType.TEXT,
        universalIdentifier: 'person-city',
      },
    ],
  },
];

describe('buildValidationRulePreviewRelationGqlFields', () => {
  it('should load the name of a related record read as a whole, so the preview does not show it as empty', () => {
    expect(
      buildValidationRulePreviewRelationGqlFields({
        readFieldPaths: ['company'],
        fields: FIELDS,
      }),
    ).toEqual({ company: { id: true, name: true } });
  });

  it('should load only the fields read through the relation', () => {
    expect(
      buildValidationRulePreviewRelationGqlFields({
        readFieldPaths: ['company', 'company.employees', 'stage'],
        fields: FIELDS,
      }),
    ).toEqual({ company: { id: true, name: true, employees: true } });
  });

  it('should load the id alone when the related object has no name field', () => {
    expect(
      buildValidationRulePreviewRelationGqlFields({
        readFieldPaths: ['pointOfContact'],
        fields: FIELDS,
      }),
    ).toEqual({ pointOfContact: { id: true } });
  });
});
