import { FieldMetadataType, RelationType } from 'twenty-shared/types';

import { FilterArgProcessorService } from 'src/engine/api/common/common-args-processors/filter-arg-processor/filter-arg-processor.service';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

describe('FilterArgProcessorService', () => {
  const filterArgProcessorService = new FilterArgProcessorService();

  const createMockField = ({
    id,
    name,
    type,
    ...overrides
  }: Partial<FlatFieldMetadata> & {
    id: string;
    name: string;
    type: FieldMetadataType;
  }): FlatFieldMetadata =>
    ({
      id,
      name,
      type,
      universalIdentifier: id,
      objectMetadataId: 'person-object-id',
      isNullable: true,
      ...overrides,
    }) as FlatFieldMetadata;

  const companyNameField = createMockField({
    id: 'company-name-id',
    name: 'name',
    type: FieldMetadataType.TEXT,
    objectMetadataId: 'company-object-id',
  });

  const companyLikeField = createMockField({
    id: 'company-like-id',
    name: 'like',
    type: FieldMetadataType.TEXT,
    objectMetadataId: 'company-object-id',
  });

  const companyField = createMockField({
    id: 'company-id',
    name: 'company',
    type: FieldMetadataType.RELATION,
    relationTargetObjectMetadataId: 'company-object-id',
    settings: {
      relationType: RelationType.MANY_TO_ONE,
      joinColumnName: 'companyId',
    },
  });

  const fields = [
    createMockField({ id: 'id-id', name: 'id', type: FieldMetadataType.UUID }),
    createMockField({
      id: 'job-title-id',
      name: 'jobTitle',
      type: FieldMetadataType.TEXT,
    }),
    createMockField({
      id: 'notes-id',
      name: 'notes',
      type: FieldMetadataType.RICH_TEXT,
    }),
    companyField,
  ];

  const allFields = [...fields, companyNameField, companyLikeField];

  const flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata> = {
    byUniversalIdentifier: Object.fromEntries(
      allFields.map((field) => [field.universalIdentifier, field]),
    ),
    universalIdentifierById: Object.fromEntries(
      allFields.map((field) => [field.id, field.universalIdentifier]),
    ),
    universalIdentifiersByApplicationId: {},
  };

  const flatObjectMetadata = {
    id: 'person-object-id',
    nameSingular: 'person',
    fieldIds: fields.map((field) => field.id),
  } as unknown as FlatObjectMetadata;

  const companyObjectMetadata = {
    id: 'company-object-id',
    nameSingular: 'company',
    fieldIds: [companyNameField.id, companyLikeField.id],
  } as unknown as FlatObjectMetadata;

  const flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata> = {
    byUniversalIdentifier: {
      'person-object-id': flatObjectMetadata,
      'company-object-id': companyObjectMetadata,
    },
    universalIdentifierById: {
      'person-object-id': 'person-object-id',
      'company-object-id': 'company-object-id',
    },
    universalIdentifiersByApplicationId: {},
  };

  const processFilter = (filter: Record<string, unknown>) =>
    filterArgProcessorService.process({
      filter,
      flatObjectMetadata,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
    });

  it('should accept a text operator nested under a rich text sub field', () => {
    expect(processFilter({ notes: { markdown: { ilike: '%ada%' } } })).toEqual({
      notes: { markdown: { ilike: '%ada%' } },
    });
  });

  it('should explain how to nest an operator placed at the filter root', () => {
    expect(() => processFilter({ ilike: '%ada%' })).toThrow(
      'Object person doesn\'t have any "ilike" field. "ilike" is a filter operator and must be nested under a field: { <fieldName>: { ilike: <value> } }.',
    );
  });

  it('should explain how to nest an operator placed inside a logical group', () => {
    expect(() =>
      processFilter({ or: [{ jobTitle: { eq: 'CEO' } }, { like: '%ada%' }] }),
    ).toThrow('"like" is a filter operator and must be nested under a field');
  });

  it('should not add an operator hint for an unknown field name', () => {
    expect(() => processFilter({ unknownField: { eq: 'value' } })).toThrow(
      /^Object person doesn't have any "unknownField" field\.$/,
    );
  });

  it('should list rich text sub fields when an operator is applied to the composite field', () => {
    expect(() => processFilter({ notes: { ilike: '%ada%' } })).toThrow(
      'Sub field "ilike" not found for composite type: RICH_TEXT. Available sub fields: blocknote, markdown. Nest the operator under a sub field: { notes: { <subFieldName>: { ilike: <value> } } }.',
    );
  });

  it('should accept a filter on the related object fields of a many-to-one relation', () => {
    expect(processFilter({ company: { name: { eq: 'Acme' } } })).toEqual({
      company: { name: { eq: 'Acme' } },
    });
  });

  it('should point to the join column when an operator is applied to a many-to-one relation', () => {
    expect(() => processFilter({ company: { eq: 'company-uuid' } })).toThrow(
      'Cannot filter by relation field "company": use "companyId" instead',
    );
  });

  it('should accept a related object field whose name matches an operator', () => {
    expect(processFilter({ company: { like: { eq: 'Acme' } } })).toEqual({
      company: { like: { eq: 'Acme' } },
    });
  });

  it('should not suggest nesting the search operator under a field', () => {
    expect(() => processFilter({ search: 'ada' })).toThrow(
      /^Object person doesn't have any "search" field\.$/,
    );
  });
});
