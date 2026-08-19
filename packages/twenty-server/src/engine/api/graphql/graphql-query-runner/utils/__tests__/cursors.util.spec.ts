import {
  FieldMetadataType,
  OrderByDirection,
  RelationType,
} from 'twenty-shared/types';

import { type ObjectRecordOrderBy } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { decodeCursor, encodeCursor } from '../cursors.util';

const buildMockField = (
  id: string,
  name: string,
  type: FieldMetadataType,
  overrides: Partial<FlatFieldMetadata> = {},
): FlatFieldMetadata =>
  ({
    id,
    universalIdentifier: id,
    name,
    type,
    ...overrides,
    objectMetadataId: 'obj-id',
    workspaceId: 'ws-id',
    label: name,
    isNullable: true,
    isLabelSyncedWithName: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    viewFieldIds: [],
    viewFilterIds: [],
    kanbanAggregateOperationViewIds: [],
    calendarViewIds: [],
    applicationId: null,
  }) as unknown as FlatFieldMetadata;

const nameField = buildMockField('name-id', 'name', FieldMetadataType.TEXT);
const fullNameField = buildMockField(
  'fullname-id',
  'fullName',
  FieldMetadataType.FULL_NAME,
);
const companyField = buildMockField(
  'company-id',
  'company',
  FieldMetadataType.RELATION,
  { settings: { relationType: RelationType.MANY_TO_ONE } },
);
const ownerField = buildMockField(
  'owner-id',
  'owner',
  FieldMetadataType.MORPH_RELATION,
  { settings: { relationType: RelationType.MANY_TO_ONE } },
);

const flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata> = {
  byUniversalIdentifier: {
    'name-id': nameField,
    'fullname-id': fullNameField,
    'company-id': companyField,
    'owner-id': ownerField,
  },
  universalIdentifierById: {
    'name-id': 'name-id',
    'fullname-id': 'fullname-id',
    'company-id': 'company-id',
    'owner-id': 'owner-id',
  },
  universalIdentifiersByApplicationId: {},
};

const flatObjectMetadata: FlatObjectMetadata = {
  id: 'obj-id',
  universalIdentifier: 'obj-id',
  workspaceId: 'ws-id',
  nameSingular: 'person',
  namePlural: 'people',
  labelSingular: 'Person',
  labelPlural: 'People',
  targetTableName: 'person',
  isRemote: false,
  isActive: true,
  isSystem: false,
  isAuditLogged: false,
  isSearchable: false,
  icon: 'Icon123',
  createdAt: new Date(),
  updatedAt: new Date(),
  fieldIds: ['name-id', 'fullname-id', 'company-id', 'owner-id'],
  indexMetadataIds: [],
  viewIds: [],
  applicationId: null,
} as unknown as FlatObjectMetadata;

const callEncodeCursor = (
  record: Record<string, unknown>,
  orderBy: Parameters<typeof encodeCursor>[0]['order'],
) =>
  encodeCursor({
    objectRecord: record as never,
    order: orderBy,
    flatObjectMetadata,
    flatFieldMetadataMaps,
  });

describe('encodeCursor', () => {
  it('should encode scalar fields from the orderBy', () => {
    const record = { id: 'abc', name: 'John', age: 30 };
    const orderBy = [{ name: OrderByDirection.AscNullsLast }];

    const decoded = decodeCursor(callEncodeCursor(record, orderBy));

    expect(decoded).toEqual({ name: 'John', id: 'abc' });
  });

  it('should always include id even if not in orderBy', () => {
    const record = { id: 'abc', name: 'John' };
    const orderBy = [{ name: OrderByDirection.AscNullsLast }];

    const decoded = decodeCursor(callEncodeCursor(record, orderBy));

    expect(decoded).toHaveProperty('id', 'abc');
  });

  it('should only include ordered sub-fields for composite fields', () => {
    const record = {
      id: 'abc',
      fullName: { firstName: 'Katherine', lastName: 'Abbott' },
    };
    const orderBy = [
      { fullName: { firstName: OrderByDirection.AscNullsLast } },
    ];

    const decoded = decodeCursor(callEncodeCursor(record, orderBy));

    expect(decoded).toEqual({
      fullName: { firstName: 'Katherine' },
      id: 'abc',
    });
    expect(decoded.fullName).not.toHaveProperty('lastName');
  });

  it('should include all sub-fields when all are in the orderBy', () => {
    const record = {
      id: 'abc',
      fullName: { firstName: 'Katherine', lastName: 'Abbott' },
    };
    const orderBy = [
      {
        fullName: {
          firstName: OrderByDirection.AscNullsLast,
          lastName: OrderByDirection.AscNullsLast,
        },
      },
    ];

    const decoded = decodeCursor(callEncodeCursor(record, orderBy));

    expect(decoded).toEqual({
      fullName: { firstName: 'Katherine', lastName: 'Abbott' },
      id: 'abc',
    });
  });

  it('should deep-merge two separate entries for the same composite parent', () => {
    const record = {
      id: 'abc',
      fullName: { firstName: 'Katherine', lastName: 'Watts' },
    };
    const orderBy: ObjectRecordOrderBy = [
      { fullName: { firstName: OrderByDirection.AscNullsFirst } },
      { fullName: { lastName: OrderByDirection.DescNullsLast } },
    ];

    const decoded = decodeCursor(callEncodeCursor(record, orderBy));

    expect(decoded).toEqual({
      fullName: { firstName: 'Katherine', lastName: 'Watts' },
      id: 'abc',
    });
  });

  it('should not filter sub-fields for scalar fields', () => {
    const record = { id: 'abc', name: 'John' };
    const orderBy = [{ name: OrderByDirection.AscNullsLast }];

    const decoded = decodeCursor(callEncodeCursor(record, orderBy));

    expect(decoded).toEqual({ name: 'John', id: 'abc' });
  });

  it('should preserve null sort values in the cursor', () => {
    const record = { id: 'abc', name: null };
    const orderBy = [{ name: OrderByDirection.AscNullsLast }];

    const decoded = decodeCursor(callEncodeCursor(record, orderBy));

    expect(decoded).toEqual({ name: null, id: 'abc' });
  });

  it('should carry only the ordered sub-field of a loaded relation', () => {
    const record = {
      id: 'abc',
      company: { id: 'company-1', name: 'Acme', employees: 10 },
    };
    const orderBy = [
      { company: { name: OrderByDirection.AscNullsLast } },
    ] as Parameters<typeof encodeCursor>[0]['order'];

    const decoded = decodeCursor(callEncodeCursor(record, orderBy));

    expect(decoded).toEqual({ company: { name: 'Acme' }, id: 'abc' });
  });

  it('should carry null for a relation orderBy entry when there is no related record', () => {
    const record = { id: 'abc', company: null };
    const orderBy = [
      { company: { name: OrderByDirection.AscNullsLast } },
    ] as Parameters<typeof encodeCursor>[0]['order'];

    const decoded = decodeCursor(callEncodeCursor(record, orderBy));

    expect(decoded).toEqual({ company: { name: null }, id: 'abc' });
  });

  it('should leave the relation orderBy entry out when the relation is not loaded', () => {
    const record = { id: 'abc' };
    const orderBy = [
      { company: { name: OrderByDirection.AscNullsLast } },
    ] as Parameters<typeof encodeCursor>[0]['order'];

    const decoded = decodeCursor(callEncodeCursor(record, orderBy));

    expect(decoded).toEqual({ id: 'abc' });
  });

  it('should prefer relation order values from the ordering join over the loaded record', () => {
    const record = { id: 'abc' };
    const orderBy = [
      { company: { name: OrderByDirection.AscNullsLast } },
    ] as Parameters<typeof encodeCursor>[0]['order'];

    const decoded = decodeCursor(
      encodeCursor({
        objectRecord: record as never,
        order: orderBy,
        flatObjectMetadata,
        flatFieldMetadataMaps,
        orderByValuesFromScan: { company: { name: 'Acme' } },
      }),
    );

    expect(decoded).toEqual({ company: { name: 'Acme' }, id: 'abc' });
  });

  it('should nest composite target values of a relation orderBy', () => {
    const record = { id: 'abc' };
    const orderBy = [
      {
        company: { contactName: { firstName: OrderByDirection.AscNullsLast } },
      },
      { company: { contactName: { lastName: OrderByDirection.AscNullsLast } } },
    ] as unknown as Parameters<typeof encodeCursor>[0]['order'];

    const decoded = decodeCursor(
      encodeCursor({
        objectRecord: record as never,
        order: orderBy,
        flatObjectMetadata,
        flatFieldMetadataMaps,
        orderByValuesFromScan: {
          company: { contactName: { firstName: 'Ada', lastName: null } },
        },
      }),
    );

    expect(decoded).toEqual({
      company: { contactName: { firstName: 'Ada', lastName: null } },
      id: 'abc',
    });
  });

  it('should encode join column values when ordering by the foreign key', () => {
    const record = { id: 'abc', companyId: 'company-1' };
    const orderBy = [{ companyId: OrderByDirection.AscNullsLast }];

    const decoded = decodeCursor(callEncodeCursor(record, orderBy));

    expect(decoded).toEqual({ companyId: 'company-1', id: 'abc' });
  });

  it('should carry morph relation sub-field values like relation ones', () => {
    const record = {
      id: 'abc',
      owner: { id: 'owner-1', name: 'Morph target' },
    };
    const orderBy = [
      { owner: { name: OrderByDirection.AscNullsLast } },
    ] as Parameters<typeof encodeCursor>[0]['order'];

    const decoded = decodeCursor(callEncodeCursor(record, orderBy));

    expect(decoded).toEqual({ owner: { name: 'Morph target' }, id: 'abc' });
  });

  it('should handle undefined orderBy', () => {
    const record = { id: 'abc', name: 'John' };

    const decoded = decodeCursor(callEncodeCursor(record, undefined));

    expect(decoded).toEqual({ id: 'abc' });
  });
});
