import { FieldMetadataType, RelationType } from 'twenty-shared/types';

import { computeDatabaseEventWatchedFieldName } from 'src/engine/core-modules/application/application-manifest/utils/compute-database-event-watched-field-name.util';

describe('computeDatabaseEventWatchedFieldName', () => {
  it('keeps the name of a field that is not a relation', () => {
    expect(
      computeDatabaseEventWatchedFieldName({
        name: 'stage',
        type: FieldMetadataType.SELECT,
      }),
    ).toBe('stage');
  });

  it('watches a relation to one record through its join column', () => {
    expect(
      computeDatabaseEventWatchedFieldName({
        name: 'company',
        type: FieldMetadataType.RELATION,
        relationType: RelationType.MANY_TO_ONE,
        relationTargetObjectUniversalIdentifier: 'company-object',
      }),
    ).toBe('companyId');
  });

  it('watches a morph target through its own join column', () => {
    expect(
      computeDatabaseEventWatchedFieldName({
        name: 'targetCompany',
        type: FieldMetadataType.MORPH_RELATION,
        relationType: RelationType.MANY_TO_ONE,
        relationTargetObjectUniversalIdentifier: 'company-object',
      }),
    ).toBe('targetCompanyId');
  });

  it('cannot watch a morph head, which has no join column', () => {
    expect(
      computeDatabaseEventWatchedFieldName({
        name: 'target',
        type: FieldMetadataType.MORPH_RELATION,
        relationType: RelationType.MANY_TO_ONE,
      }),
    ).toBeUndefined();
  });

  it('cannot watch a relation to many records', () => {
    expect(
      computeDatabaseEventWatchedFieldName({
        name: 'pointOfContacts',
        type: FieldMetadataType.RELATION,
        relationType: RelationType.ONE_TO_MANY,
      }),
    ).toBeUndefined();
  });
});
