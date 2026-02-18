import { Test, type TestingModule } from '@nestjs/testing';

import { FieldMetadataType } from 'twenty-shared/types';

import { DataArgProcessor } from 'src/engine/api/common/common-args-processors/data-arg-processor/data-arg.processor';
import { type AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';
import { RecordPositionService } from 'src/engine/core-modules/record-position/services/record-position.service';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

import { failingInputsByFieldMetadataType } from './constants/failing-inputs-by-field-metadata-type.constant';
import { fieldMetadataConfigByFieldName } from './constants/field-metadata-config-by-field-name.constant';
import { successfulInputsByFieldMetadataType } from './constants/successful-inputs-by-field-metadata-type.constant';

// Mock the rich text v2 transformation to avoid BlockNote module issues
jest.mock(
  'src/engine/core-modules/record-transformer/utils/transform-rich-text-v2.util',
  () => ({
    transformRichTextV2Value: jest.fn().mockImplementation((value) => value),
  }),
);

describe('DataArgProcessor', () => {
  let dataArgProcessor: DataArgProcessor;
  let recordPositionService: jest.Mocked<RecordPositionService>;

  const mockWorkspaceId = '20202020-1234-1234-1234-123456789012';

  const createMockAuthContext = (): AuthContext =>
    ({
      workspace: {
        id: mockWorkspaceId,
      },
    }) as AuthContext;

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
        name: fieldName,
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
      isCustom: false,
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
        DataArgProcessor,
        {
          provide: RecordPositionService,
          useValue: recordPositionService,
        },
      ],
    }).compile();

    dataArgProcessor = module.get<DataArgProcessor>(DataArgProcessor);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(dataArgProcessor).toBeDefined();
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
              dataArgProcessor.process({
                partialRecordInputs: [testCase.input],
                authContext: createMockAuthContext(),
                flatObjectMetadata,
                flatFieldMetadataMaps,
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

            const result = await dataArgProcessor.process({
              partialRecordInputs: [testCase.input],
              authContext: createMockAuthContext(),
              flatObjectMetadata,
              flatFieldMetadataMaps,
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
