import { FieldMetadataType, OrderByDirection } from 'twenty-shared/types';

import { GraphqlQueryRunnerException } from 'src/engine/api/graphql/graphql-query-runner/errors/graphql-query-runner.exception';
import {
  buildOrderByFromLeaves,
  checkIfLeafCanCarryCursorValue,
  getCursorValueForLeaf,
  resolveOrderByLeaves,
} from 'src/engine/api/utils/resolve-order-by-leaves.utils';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

describe('resolveOrderByLeaves', () => {
  const workspaceId = 'workspace-id';
  const objectMetadataId = 'object-id';

  const createMockField = (
    overrides: Partial<FlatFieldMetadata> & {
      id: string;
      name: string;
      type: FieldMetadataType;
    },
  ): FlatFieldMetadata =>
    ({
      workspaceId,
      objectMetadataId,
      isNullable: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      universalIdentifier: overrides.id,
      label: overrides.name,
      ...overrides,
    }) as FlatFieldMetadata;

  const idField = createMockField({
    id: 'id-id',
    type: FieldMetadataType.UUID,
    name: 'id',
    isNullable: false,
  });

  const closeDateField = createMockField({
    id: 'closedate-id',
    type: FieldMetadataType.DATE_TIME,
    name: 'closeDate',
  });

  const fullNameField = createMockField({
    id: 'fullname-id',
    type: FieldMetadataType.FULL_NAME,
    name: 'fullName',
  });

  const linksField = createMockField({
    id: 'links-id',
    type: FieldMetadataType.LINKS,
    name: 'domainName',
  });

  const companyField = createMockField({
    id: 'company-id',
    type: FieldMetadataType.RELATION,
    name: 'company',
    relationTargetObjectMetadataId: 'company-object-id',
    settings: {
      relationType: 'MANY_TO_ONE',
      joinColumnName: 'companyId',
      // oxlint-disable-next-line typescript/no-explicit-any
    } as any,
  });

  const fields = [
    idField,
    closeDateField,
    fullNameField,
    linksField,
    companyField,
  ];

  const flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata> = {
    byUniversalIdentifier: Object.fromEntries(
      fields.map((field) => [field.universalIdentifier, field]),
    ),
    universalIdentifierById: Object.fromEntries(
      fields.map((field) => [field.id, field.universalIdentifier]),
    ),
    universalIdentifiersByApplicationId: {},
  };

  const flatObjectMetadata = {
    id: objectMetadataId,
    workspaceId,
    nameSingular: 'opportunity',
    fieldIds: fields.map((field) => field.id),
  } as unknown as FlatObjectMetadata;

  const resolve = (
    // oxlint-disable-next-line typescript/no-explicit-any
    orderBy: any,
    strictValidation = false,
  ) =>
    resolveOrderByLeaves({
      orderBy,
      flatObjectMetadata,
      flatFieldMetadataMaps,
      strictValidation,
    });

  it('should flatten scalar, composite and relation entries into leaves with their own direction', () => {
    const leaves = resolve([
      { closeDate: OrderByDirection.DescNullsLast },
      {
        fullName: {
          firstName: OrderByDirection.AscNullsLast,
          lastName: OrderByDirection.DescNullsFirst,
        },
      },
      { company: { name: OrderByDirection.AscNullsLast } },
      { companyId: OrderByDirection.AscNullsFirst },
    ]);

    expect(
      leaves.map(({ path, direction, kind }) => ({ path, direction, kind })),
    ).toEqual([
      {
        path: ['closeDate'],
        direction: OrderByDirection.DescNullsLast,
        kind: 'scalar',
      },
      {
        path: ['fullName', 'firstName'],
        direction: OrderByDirection.AscNullsLast,
        kind: 'composite',
      },
      {
        path: ['fullName', 'lastName'],
        direction: OrderByDirection.DescNullsFirst,
        kind: 'composite',
      },
      {
        path: ['company', 'name'],
        direction: OrderByDirection.AscNullsLast,
        kind: 'relation',
      },
      {
        path: ['companyId'],
        direction: OrderByDirection.AscNullsFirst,
        kind: 'scalar',
      },
    ]);
  });

  it('should keep the first occurrence when a leaf is duplicated', () => {
    const leaves = resolve([
      { closeDate: OrderByDirection.AscNullsLast },
      { closeDate: OrderByDirection.DescNullsFirst },
    ]);

    expect(leaves).toHaveLength(1);
    expect(leaves[0].direction).toBe(OrderByDirection.AscNullsLast);
  });

  it('should let a caller-provided id ordering win over the appended tie-breaker', () => {
    const leaves = resolve([
      { id: OrderByDirection.DescNullsLast },
      { id: OrderByDirection.AscNullsFirst },
    ]);

    expect(leaves).toHaveLength(1);
    expect(leaves[0].direction).toBe(OrderByDirection.DescNullsLast);
  });

  it('should rebuild the canonical orderBy from the leaves', () => {
    const leaves = resolve([
      {
        fullName: {
          firstName: OrderByDirection.AscNullsLast,
          lastName: OrderByDirection.AscNullsLast,
        },
      },
      { company: { name: OrderByDirection.DescNullsLast } },
      { id: OrderByDirection.AscNullsFirst },
    ]);

    expect(buildOrderByFromLeaves(leaves)).toEqual([
      { fullName: { firstName: OrderByDirection.AscNullsLast } },
      { fullName: { lastName: OrderByDirection.AscNullsLast } },
      { company: { name: OrderByDirection.DescNullsLast } },
      { id: OrderByDirection.AscNullsFirst },
    ]);
  });

  it('should flatten a relation entry ordered by a composite target field', () => {
    const leaves = resolve([
      { company: { name: { firstName: OrderByDirection.AscNullsLast } } },
      { company: { name: { lastName: OrderByDirection.AscNullsLast } } },
    ]);

    expect(leaves.map(({ path }) => path)).toEqual([
      ['company', 'name', 'firstName'],
      ['company', 'name', 'lastName'],
    ]);
    expect(buildOrderByFromLeaves(leaves)).toEqual([
      { company: { name: { firstName: OrderByDirection.AscNullsLast } } },
      { company: { name: { lastName: OrderByDirection.AscNullsLast } } },
    ]);
  });

  it('should skip unknown fields when lenient and throw when strict', () => {
    expect(resolve([{ unknownField: OrderByDirection.AscNullsLast }])).toEqual(
      [],
    );

    expect(() =>
      resolve([{ unknownField: OrderByDirection.AscNullsLast }], true),
    ).toThrow(GraphqlQueryRunnerException);
  });

  it('should reject malformed entries in strict mode', () => {
    expect(() => resolve([{ closeDate: { nested: 'value' } }], true)).toThrow(
      'requires a direction value',
    );
    expect(() =>
      resolve([{ fullName: OrderByDirection.AscNullsLast }], true),
    ).toThrow('requires subfield ordering');
    expect(() =>
      resolve(
        [{ fullName: { unknownSub: OrderByDirection.AscNullsLast } }],
        true,
      ),
    ).toThrow('not found for composite field');
    expect(() =>
      resolve([{ company: OrderByDirection.AscNullsLast }], true),
    ).toThrow('requires nested field ordering');
  });

  it('should exclude relation and RAW_JSON leaves from cursor use', () => {
    const leaves = resolve([
      { company: { name: OrderByDirection.AscNullsLast } },
      { domainName: { primaryLinkUrl: OrderByDirection.AscNullsLast } },
      { domainName: { secondaryLinks: OrderByDirection.AscNullsLast } },
      { id: OrderByDirection.AscNullsFirst },
    ]);

    expect(
      leaves
        .filter(checkIfLeafCanCarryCursorValue)
        .map(({ path }) => path.join('.')),
    ).toEqual(['domainName.primaryLinkUrl', 'id']);
  });

  describe('getCursorValueForLeaf', () => {
    const firstNameLeaf = resolve([
      { fullName: { firstName: OrderByDirection.AscNullsLast } },
    ])[0];

    it('should read nested values, including null', () => {
      expect(
        getCursorValueForLeaf(
          { fullName: { firstName: 'Ada' } },
          firstNameLeaf,
        ),
      ).toBe('Ada');
      expect(
        getCursorValueForLeaf({ fullName: { firstName: null } }, firstNameLeaf),
      ).toBeNull();
      expect(getCursorValueForLeaf({}, firstNameLeaf)).toBeUndefined();
    });

    it('should fall back to legacy dotted cursor keys', () => {
      expect(
        getCursorValueForLeaf({ 'fullName.firstName': 'Ada' }, firstNameLeaf),
      ).toBe('Ada');
    });
  });
});
