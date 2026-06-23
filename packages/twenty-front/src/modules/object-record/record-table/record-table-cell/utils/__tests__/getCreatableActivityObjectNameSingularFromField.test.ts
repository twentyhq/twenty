import { CoreObjectNameSingular, FieldMetadataType } from 'twenty-shared/types';

import { getCreatableActivityObjectNameSingularFromField } from '@/object-record/record-table/record-table-cell/utils/getCreatableActivityObjectNameSingularFromField';

describe('getCreatableActivityObjectNameSingularFromField', () => {
  it('returns Note for a read-only noteTargets relation on a non-activity object', () => {
    expect(
      getCreatableActivityObjectNameSingularFromField({
        fieldName: 'noteTargets',
        fieldType: FieldMetadataType.RELATION,
        objectNameSingular: CoreObjectNameSingular.Person,
        isRecordFieldReadOnly: true,
      }),
    ).toBe(CoreObjectNameSingular.Note);
  });

  it('returns Task for a read-only taskTargets relation on a non-activity object', () => {
    expect(
      getCreatableActivityObjectNameSingularFromField({
        fieldName: 'taskTargets',
        fieldType: FieldMetadataType.RELATION,
        objectNameSingular: CoreObjectNameSingular.Company,
        isRecordFieldReadOnly: true,
      }),
    ).toBe(CoreObjectNameSingular.Task);
  });

  it('returns undefined when the activity target field is editable', () => {
    expect(
      getCreatableActivityObjectNameSingularFromField({
        fieldName: 'noteTargets',
        fieldType: FieldMetadataType.RELATION,
        objectNameSingular: CoreObjectNameSingular.Person,
        isRecordFieldReadOnly: false,
      }),
    ).toBeUndefined();
  });

  it('returns undefined for noteTargets on the Note object itself', () => {
    expect(
      getCreatableActivityObjectNameSingularFromField({
        fieldName: 'noteTargets',
        fieldType: FieldMetadataType.RELATION,
        objectNameSingular: CoreObjectNameSingular.Note,
        isRecordFieldReadOnly: true,
      }),
    ).toBeUndefined();
  });

  it('returns undefined for taskTargets on the Task object itself', () => {
    expect(
      getCreatableActivityObjectNameSingularFromField({
        fieldName: 'taskTargets',
        fieldType: FieldMetadataType.RELATION,
        objectNameSingular: CoreObjectNameSingular.Task,
        isRecordFieldReadOnly: true,
      }),
    ).toBeUndefined();
  });

  it('returns undefined when the field is not a relation', () => {
    expect(
      getCreatableActivityObjectNameSingularFromField({
        fieldName: 'noteTargets',
        fieldType: FieldMetadataType.TEXT,
        objectNameSingular: CoreObjectNameSingular.Person,
        isRecordFieldReadOnly: true,
      }),
    ).toBeUndefined();
  });

  it('returns undefined for any other relation field', () => {
    expect(
      getCreatableActivityObjectNameSingularFromField({
        fieldName: 'opportunities',
        fieldType: FieldMetadataType.RELATION,
        objectNameSingular: CoreObjectNameSingular.Person,
        isRecordFieldReadOnly: true,
      }),
    ).toBeUndefined();
  });
});
