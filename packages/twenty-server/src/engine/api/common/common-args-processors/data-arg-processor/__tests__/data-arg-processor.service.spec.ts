import { Test, type TestingModule } from '@nestjs/testing';

import { FieldMetadataType, RelationType } from 'twenty-shared/types';

import { DataArgProcessorService } from 'src/engine/api/common/common-args-processors/data-arg-processor/data-arg-processor.service';
import { type SystemWorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { RecordPositionService } from 'src/engine/core-modules/record-position/services/record-position.service';
import { type FlatWorkspace } from 'src/engine/core-modules/workspace/types/flat-workspace.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

import { failingInputsByFieldMetadataType } from './constants/failing-inputs-by-field-metadata-type.constant';
import { fieldMetadataConfigByFieldName } from './constants/field-metadata-config-by-field-name.constant';
import { successfulInputsByFieldMetadataType } from './constants/successful-inputs-by-field-metadata-type.constant';

// Mock the rich text v2 transformation to avoid BlockNote module issues
jest.mock(
  'src/engine/core-modules/record-transformer/utils/transform-rich-text.util',
  () => ({
    transformRichTextValue: jest.fn().mockImplementation((value) => value),
  }),
);

describe('DataArgProcessorService', () => {
  let dataArgProcessorService: DataArgProcessorService;
  let recordPositionService: jest.Mocked<RecordPositionService>;

  const mockWorkspaceId = '20202020-1234-1234-1234-123456789012';

  const createMockAuthContext = (): SystemWorkspaceAuthContext => ({
    type: 'system',
    workspace: { id: mockWorkspaceId } as FlatWorkspace,
  });

  const createFlatFieldMetadataMaps = (
    fieldNames: string[],
  ): FlatEntityMaps<FlatFieldMetadata> => {
    const byUniversalIdentifier: Record<string, FlatFieldMetadata> = {};
    const universalIdentifierById: Record<string, string> = {};

    for (const fieldName of fieldNames) {
      const config = fieldMetadataConfigByFieldName[fieldName];

      if (!config) {
        throw new Error(`No config found for field: ${fieldName}`);
      }

      const fieldId = `${fieldName}-id`;
      const universalId = `${fieldName}-universal-id`;

      byUniversalIdentifier[universalId] = {
        id: fieldId,
        name: config.name,
        type: config.type ?? FieldMetadataType.TEXT,
        isNullable: config.isNullable ?? true,
        objectMetadataId: 'object-id',
        universalIdentifier: universalId,
        options: config.options,
        settings: config.settings,
        defaultValue: config.defaultValue,
      } as FlatFieldMetadata;

      universalIdentifierById[fieldId] = universalId;
    }

    return {
      byUniversalIdentifier,
      universalIdentifierById,
      universalIdentifiersByApplicationId: {},
    };
  };

  const createFlatObjectMetadata = (fieldNames: string[]): FlatObjectMetadata =>
    ({
      id: 'object-id',
      nameSingular: 'testObject',
      namePlural: 'testObjects',
      fieldIds: fieldNames.map((name) => `${name}-id`),
      universalIdentifier: 'test-object-universal-id',
      labelIdentifierFieldMetadataUniversalIdentifier: null,
      imageIdentifierFieldMetadataUniversalIdentifier: null,
    }) as FlatObjectMetadata;

  beforeEach(async () => {
    recordPositionService = {
      overridePositionOnRecords: jest
        .fn()
        .mockImplementation(({ partialRecordInputs }) => partialRecordInputs),
      buildRecordPosition: jest.fn(),
      findByPosition: jest.fn(),
      updatePosition: jest.fn(),
    } as unknown as jest.Mocked<RecordPositionService>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DataArgProcessorService,
        {
          provide: RecordPositionService,
          useValue: recordPositionService,
        },
      ],
    }).compile();

    dataArgProcessorService = module.get<DataArgProcessorService>(
      DataArgProcessorService,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(dataArgProcessorService).toBeDefined();
  });

  it('should normalize relation connect where composite values', async () => {
    const flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata> = {
      byUniversalIdentifier: {
        'company-universal-id': {
          id: 'company-id',
          name: 'company',
          type: FieldMetadataType.RELATION,
          isNullable: true,
          objectMetadataId: 'object-id',
          universalIdentifier: 'company-universal-id',
          relationTargetObjectMetadataId: 'target-company-object-id',
          settings: {
            relationType: RelationType.MANY_TO_ONE,
            joinColumnName: 'companyId',
          },
        } as FlatFieldMetadata,
        'emails-universal-id': {
          id: 'emails-id',
          name: 'emails',
          type: FieldMetadataType.EMAILS,
          isNullable: true,
          objectMetadataId: 'target-company-object-id',
          universalIdentifier: 'emails-universal-id',
        } as FlatFieldMetadata,
        'domainName-universal-id': {
          id: 'domainName-id',
          name: 'domainName',
          type: FieldMetadataType.LINKS,
          isNullable: true,
          objectMetadataId: 'target-company-object-id',
          universalIdentifier: 'domainName-universal-id',
        } as FlatFieldMetadata,
      },
      universalIdentifierById: {
        'company-id': 'company-universal-id',
        'emails-id': 'emails-universal-id',
        'domainName-id': 'domainName-universal-id',
      },
      universalIdentifiersByApplicationId: {},
    };

    const flatObjectMetadata = {
      id: 'object-id',
      nameSingular: 'testObject',
      namePlural: 'testObjects',
      fieldIds: ['company-id'],
      universalIdentifier: 'test-object-universal-id',
      labelIdentifierFieldMetadataUniversalIdentifier: null,
      imageIdentifierFieldMetadataUniversalIdentifier: null,
    } as FlatObjectMetadata;

    const flatObjectMetadataMaps = {
      byUniversalIdentifier: {
        'target-company-universal-id': {
          id: 'target-company-object-id',
          nameSingular: 'company',
          namePlural: 'companies',
          fieldIds: ['emails-id', 'domainName-id'],
          universalIdentifier: 'target-company-universal-id',
          labelIdentifierFieldMetadataUniversalIdentifier: null,
          imageIdentifierFieldMetadataUniversalIdentifier: null,
        } as FlatObjectMetadata,
      },
      universalIdentifierById: {
        'target-company-object-id': 'target-company-universal-id',
      },
      universalIdentifiersByApplicationId: {},
    };

    const result = await dataArgProcessorService.process({
      partialRecordInputs: [
        {
          company: {
            connect: {
              where: {
                emails: {
                  primaryEmail: 'User@Example.COM',
                },
                domainName: {
                  primaryLinkUrl: 'HTTPS://Example.COM/path/',
                },
              },
            },
          },
        },
      ],
      authContext: createMockAuthContext(),
      flatObjectMetadata,
      flatFieldMetadataMaps,
      flatObjectMetadataMaps,
    });

    expect(result).toEqual([
      {
        company: {
          connect: {
            where: {
              emails: {
                primaryEmail: 'user@example.com',
              },
              domainName: {
                primaryLinkUrl: 'https://example.com/path',
              },
            },
          },
        },
      },
    ]);
  });

  describe('server-controlled system fields', () => {
    // Builds a maps entry for a single field. isSystemSideEffect and isUIEditable
    // are set independently on purpose: the guard keys off isSystemSideEffect, not
    // isUIEditable, so the tests must be able to express a field that is read-only
    // in the UI yet NOT a system side-effect (e.g. a message's receivedAt).
    const createSystemFieldMaps = ({
      name,
      type,
      isSystemSideEffect,
      isUIEditable = false,
    }: {
      name: string;
      type: FieldMetadataType;
      isSystemSideEffect: boolean;
      isUIEditable?: boolean;
    }): FlatEntityMaps<FlatFieldMetadata> => ({
      byUniversalIdentifier: {
        [`${name}-universal-id`]: {
          id: `${name}-id`,
          name,
          type,
          isNullable: true,
          objectMetadataId: 'object-id',
          universalIdentifier: `${name}-universal-id`,
          isUIEditable,
          isSystemSideEffect,
        } as FlatFieldMetadata,
      },
      universalIdentifierById: {
        [`${name}-id`]: `${name}-universal-id`,
      },
      universalIdentifiersByApplicationId: {},
    });

    const emptyObjectMaps: FlatEntityMaps<FlatObjectMetadata> = {
      byUniversalIdentifier: {},
      universalIdentifierById: {},
      universalIdentifiersByApplicationId: {},
    };

    // createdAt/updatedAt/deletedAt are the only DATE_TIME fields with
    // isSystemSideEffect=true, so they must be rejected when supplied by a client.
    it.each(['createdAt', 'updatedAt', 'deletedAt'])(
      'should reject client-supplied value for system-side-effect field %s',
      async (fieldName) => {
        const flatFieldMetadataMaps = createSystemFieldMaps({
          name: fieldName,
          type: FieldMetadataType.DATE_TIME,
          isSystemSideEffect: true,
        });
        const flatObjectMetadata = createFlatObjectMetadata([fieldName]);

        await expect(
          dataArgProcessorService.process({
            partialRecordInputs: [{ [fieldName]: '1999-01-01T00:00:00.000Z' }],
            authContext: createMockAuthContext(),
            flatObjectMetadata,
            flatFieldMetadataMaps,
            flatObjectMetadataMaps: emptyObjectMaps,
          }),
        ).rejects.toThrow(
          `Field "${fieldName}" is read-only and cannot be set by the client.`,
        );
      },
    );

    it('should allow a client-supplied value for a normal editable DATE_TIME field', async () => {
      const flatFieldMetadataMaps = createSystemFieldMaps({
        name: 'closeDate',
        type: FieldMetadataType.DATE_TIME,
        isSystemSideEffect: false,
        isUIEditable: true,
      });
      const flatObjectMetadata = createFlatObjectMetadata(['closeDate']);

      const result = await dataArgProcessorService.process({
        partialRecordInputs: [{ closeDate: '1999-01-01T00:00:00.000Z' }],
        authContext: createMockAuthContext(),
        flatObjectMetadata,
        flatFieldMetadataMaps,
        flatObjectMetadataMaps: emptyObjectMaps,
      });

      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty('closeDate');
    });

    // Regression guard for the narrowed scope: a field that is read-only in the
    // UI (isUIEditable=false) but NOT a system side-effect — e.g. a message's
    // receivedAt, set on write by the import pipeline — must still be accepted.
    it('should allow a UI-read-only field that is not a system side-effect (e.g. receivedAt)', async () => {
      const flatFieldMetadataMaps = createSystemFieldMaps({
        name: 'receivedAt',
        type: FieldMetadataType.DATE_TIME,
        isSystemSideEffect: false,
        isUIEditable: false,
      });
      const flatObjectMetadata = createFlatObjectMetadata(['receivedAt']);

      const result = await dataArgProcessorService.process({
        partialRecordInputs: [{ receivedAt: '1999-01-01T00:00:00.000Z' }],
        authContext: createMockAuthContext(),
        flatObjectMetadata,
        flatFieldMetadataMaps,
        flatObjectMetadataMaps: emptyObjectMaps,
      });

      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty('receivedAt');
    });
  });

  describe('failing inputs validation', () => {
    const fieldMetadataTypesToTest = Object.keys(
      failingInputsByFieldMetadataType,
    ) as FieldMetadataType[];

    for (const fieldMetadataType of fieldMetadataTypesToTest) {
      const testCases = failingInputsByFieldMetadataType[fieldMetadataType];

      if (!testCases) {
        continue;
      }

      describe(`${fieldMetadataType}`, () => {
        for (const [index, testCase] of testCases.entries()) {
          const fieldName = Object.keys(testCase.input)[0];
          const fieldValue = testCase.input[fieldName];

          it(`should throw for invalid input #${index + 1}: ${JSON.stringify(fieldValue)}`, async () => {
            const fieldNames = [fieldName];

            const flatFieldMetadataMaps =
              createFlatFieldMetadataMaps(fieldNames);
            const flatObjectMetadata = createFlatObjectMetadata(fieldNames);

            await expect(
              dataArgProcessorService.process({
                partialRecordInputs: [testCase.input],
                authContext: createMockAuthContext(),
                flatObjectMetadata,
                flatFieldMetadataMaps,
                flatObjectMetadataMaps: {
                  byUniversalIdentifier: {},
                  universalIdentifierById: {},
                  universalIdentifiersByApplicationId: {},
                },
              }),
            ).rejects.toThrowErrorMatchingSnapshot();
          });
        }
      });
    }
  });

  describe('successful inputs validation', () => {
    const fieldMetadataTypesToTest = Object.keys(
      successfulInputsByFieldMetadataType,
    ) as FieldMetadataType[];

    for (const fieldMetadataType of fieldMetadataTypesToTest) {
      const testCases = successfulInputsByFieldMetadataType[fieldMetadataType];

      if (!testCases) {
        continue;
      }

      describe(`${fieldMetadataType}`, () => {
        for (const [index, testCase] of testCases.entries()) {
          const fieldName = Object.keys(testCase.input)[0];
          const fieldValue = testCase.input[fieldName];

          it(`should process valid input #${index + 1}: ${JSON.stringify(fieldValue)}`, async () => {
            const fieldNames = [fieldName];

            const flatFieldMetadataMaps =
              createFlatFieldMetadataMaps(fieldNames);
            const flatObjectMetadata = createFlatObjectMetadata(fieldNames);

            const result = await dataArgProcessorService.process({
              partialRecordInputs: [testCase.input],
              authContext: createMockAuthContext(),
              flatObjectMetadata,
              flatFieldMetadataMaps,
              flatObjectMetadataMaps: {
                byUniversalIdentifier: {},
                universalIdentifierById: {},
                universalIdentifiersByApplicationId: {},
              },
            });

            expect(result).toBeDefined();
            expect(result).toHaveLength(1);
            expect(result[0]).toEqual(testCase.expectedOutput);
          });
        }
      });
    }
  });
});
