import { CoreObjectNameSingular, FieldMetadataType } from 'twenty-shared/types';

import { getCreatableActivityObjectNameSingularFromField } from '@/object-record/record-table/record-table-cell/utils/getCreatableActivityObjectNameSingularFromField';

describe('getCreatableActivityObjectNameSingularFromField', () => {
  it('returns Note for the noteTargets relation on a non-activity object', () => {
    expect(
      getCreatableActivityObjectNameSingularFromField({
        fieldName: 'noteTargets',
        fieldType: FieldMetadataType.RELATION,
        objectNameSingular: CoreObjectNameSingular.Person,
      }),
    ).toBe(CoreObjectNameSingular.Note);
  });

  it('returns Task for the taskTargets relation on a non-activity object', () => {
    expect(
      getCreatableActivityObjectNameSingularFromField({
        fieldName: 'taskTargets',
        fieldType: FieldMetadataType.RELATION,
        objectNameSingular: CoreObjectNameSingular.Company,
      }),
    ).toBe(CoreObjectNameSingular.Task);
  });

  it('returns undefined for noteTargets on the Note object itself', () => {
    expect(
      getCreatableActivityObjectNameSingularFromField({
        fieldName: 'noteTargets',
        fieldType: FieldMetadataType.RELATION,
        objectNameSingular: CoreObjectNameSingular.Note,
      }),
    ).toBeUndefined();
  });

  it('returns undefined for taskTargets on the Task object itself', () => {
    expect(
      getCreatableActivityObjectNameSingularFromField({
        fieldName: 'taskTargets',
        fieldType: FieldMetadataType.RELATION,
        objectNameSingular: CoreObjectNameSingular.Task,
      }),
    ).toBeUndefined();
  });

  it('returns undefined when the field is not a relation', () => {
    expect(
      getCreatableActivityObjectNameSingularFromField({
        fieldName: 'noteTargets',
        fieldType: FieldMetadataType.TEXT,
        objectNameSingular: CoreObjectNameSingular.Person,
      }),
    ).toBeUndefined();
  });

  it('returns undefined for any other relation field', () => {
    expect(
      getCreatableActivityObjectNameSingularFromField({
        fieldName: 'opportunities',
        fieldType: FieldMetadataType.RELATION,
        objectNameSingular: CoreObjectNameSingular.Person,
      }),
    ).toBeUndefined();
  });
});
