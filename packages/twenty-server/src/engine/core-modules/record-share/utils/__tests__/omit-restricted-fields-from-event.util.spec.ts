import { type ObjectRecordUpdateEvent } from 'twenty-shared/database-events';
import { FieldMetadataType, RelationType } from 'twenty-shared/types';

import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { omitRestrictedFieldsFromEvent } from 'src/engine/core-modules/record-share/utils/omit-restricted-fields-from-event.util';

const OBJECT_METADATA_ID = 'company-object-id';
const SALARY_FIELD_ID = 'salary-field-id';
const NAME_FIELD_ID = 'name-field-id';
const COMPANY_FIELD_ID = 'company-field-id';
const OWNER_FIELD_ID = 'owner-field-id';

const flatFieldMetadataMaps = [
  getFlatFieldMetadataMock({
    id: NAME_FIELD_ID,
    universalIdentifier: NAME_FIELD_ID,
    objectMetadataId: OBJECT_METADATA_ID,
    type: FieldMetadataType.TEXT,
    name: 'name',
  }),
  getFlatFieldMetadataMock({
    id: SALARY_FIELD_ID,
    universalIdentifier: SALARY_FIELD_ID,
    objectMetadataId: OBJECT_METADATA_ID,
    type: FieldMetadataType.NUMBER,
    name: 'salary',
  }),
  getFlatFieldMetadataMock({
    id: COMPANY_FIELD_ID,
    universalIdentifier: COMPANY_FIELD_ID,
    objectMetadataId: OBJECT_METADATA_ID,
    type: FieldMetadataType.RELATION,
    name: 'company',
    settings: {
      relationType: RelationType.MANY_TO_ONE,
      joinColumnName: 'companyId',
    },
  }),
  getFlatFieldMetadataMock({
    id: OWNER_FIELD_ID,
    universalIdentifier: OWNER_FIELD_ID,
    objectMetadataId: OBJECT_METADATA_ID,
    type: FieldMetadataType.RELATION,
    name: 'owner',
    settings: {
      relationType: RelationType.MANY_TO_ONE,
      joinColumnName: 'ownerWorkspaceMemberId',
    },
  }),
].reduce(
  (maps, flatEntity) =>
    addFlatEntityToFlatEntityMapsOrThrow({ flatEntity, flatEntityMaps: maps }),
  createEmptyFlatEntityMaps(),
);

const updateEvent = {
  recordId: 'record-1',
  userId: 'user-1',
  properties: {
    updatedFields: ['name', 'salary'],
    before: { id: 'record-1', name: 'Old', salary: 100 },
    after: { id: 'record-1', name: 'New', salary: 200 },
    diff: {
      name: { before: 'Old', after: 'New' },
      salary: { before: 100, after: 200 },
    },
  },
} as unknown as ObjectRecordUpdateEvent;

describe('omitRestrictedFieldsFromEvent', () => {
  it('should return the event untouched when no field is restricted', () => {
    expect(
      omitRestrictedFieldsFromEvent({
        event: updateEvent,
        restrictedFields: {
          [SALARY_FIELD_ID]: { canRead: true, canUpdate: false },
        },
        flatFieldMetadataMaps,
      }),
    ).toBe(updateEvent);
  });

  it('should return the event untouched without restricted fields', () => {
    expect(
      omitRestrictedFieldsFromEvent({
        event: updateEvent,
        restrictedFields: undefined,
        flatFieldMetadataMaps,
      }),
    ).toBe(updateEvent);
  });

  it('should drop an unreadable field from every part of the event', () => {
    expect(
      omitRestrictedFieldsFromEvent({
        event: updateEvent,
        restrictedFields: {
          [SALARY_FIELD_ID]: { canRead: false, canUpdate: false },
        },
        flatFieldMetadataMaps,
      }),
    ).toEqual({
      recordId: 'record-1',
      userId: 'user-1',
      properties: {
        updatedFields: ['name'],
        before: { id: 'record-1', name: 'Old' },
        after: { id: 'record-1', name: 'New' },
        diff: { name: { before: 'Old', after: 'New' } },
      },
    });
  });

  it('should leave no updated field when only unreadable fields changed', () => {
    const salaryOnlyUpdateEvent = {
      ...updateEvent,
      properties: {
        updatedFields: ['salary'],
        before: { id: 'record-1', salary: 100 },
        after: { id: 'record-1', salary: 200 },
      },
    } as unknown as ObjectRecordUpdateEvent;

    expect(
      omitRestrictedFieldsFromEvent({
        event: salaryOnlyUpdateEvent,
        restrictedFields: {
          [SALARY_FIELD_ID]: { canRead: false, canUpdate: false },
        },
        flatFieldMetadataMaps,
      }).properties,
    ).toEqual({
      updatedFields: [],
      before: { id: 'record-1' },
      after: { id: 'record-1' },
    });
  });

  it('should keep a deleted record whose snapshot only sits in before', () => {
    const deleteEvent = {
      recordId: 'record-1',
      properties: { before: { id: 'record-1', name: 'Old', salary: 100 } },
    } as unknown as ObjectRecordUpdateEvent;

    expect(
      omitRestrictedFieldsFromEvent({
        event: deleteEvent,
        restrictedFields: {
          [SALARY_FIELD_ID]: { canRead: false, canUpdate: false },
        },
        flatFieldMetadataMaps,
      }).properties,
    ).toEqual({ before: { id: 'record-1', name: 'Old' } });
  });

  it('should drop the join column of an unreadable relation alongside its name', () => {
    const companyUpdateEvent = {
      recordId: 'record-1',
      properties: {
        updatedFields: ['name', 'company', 'companyId'],
        before: { id: 'record-1', name: 'Old', companyId: 'company-1' },
        after: { id: 'record-1', name: 'New', companyId: 'company-2' },
        diff: {
          name: { before: 'Old', after: 'New' },
          company: { before: { id: 'company-1' }, after: { id: 'company-2' } },
        },
      },
    } as unknown as ObjectRecordUpdateEvent;

    expect(
      omitRestrictedFieldsFromEvent({
        event: companyUpdateEvent,
        restrictedFields: {
          [COMPANY_FIELD_ID]: { canRead: false, canUpdate: false },
        },
        flatFieldMetadataMaps,
      }).properties,
    ).toEqual({
      updatedFields: ['name'],
      before: { id: 'record-1', name: 'Old' },
      after: { id: 'record-1', name: 'New' },
      diff: { name: { before: 'Old', after: 'New' } },
    });
  });

  it('should drop both join column spellings when settings rename it', () => {
    const ownerUpdateEvent = {
      recordId: 'record-1',
      properties: {
        updatedFields: ['owner', 'ownerId'],
        before: { id: 'record-1', ownerWorkspaceMemberId: 'member-1' },
        after: { id: 'record-1', ownerWorkspaceMemberId: 'member-2' },
      },
    } as unknown as ObjectRecordUpdateEvent;

    expect(
      omitRestrictedFieldsFromEvent({
        event: ownerUpdateEvent,
        restrictedFields: {
          [OWNER_FIELD_ID]: { canRead: false, canUpdate: false },
        },
        flatFieldMetadataMaps,
      }).properties,
    ).toEqual({
      updatedFields: [],
      before: { id: 'record-1' },
      after: { id: 'record-1' },
    });
  });
});
