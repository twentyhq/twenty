import { Test, TestingModule } from '@nestjs/testing';

import { FieldMetadataType } from 'twenty-shared/types';

import { WorkspaceQueryRunnerOptions } from 'src/engine/api/graphql/workspace-query-runner/interfaces/query-runner-option.interface';
import { ResolverArgsType } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import { QueryRunnerArgsFactory } from 'src/engine/api/graphql/workspace-query-runner/factories/query-runner-args.factory';
import {
  RecordPositionService,
  RecordPositionServiceCreateArgs,
} from 'src/engine/core-modules/record-position/services/record-position.service';
import { RecordInputTransformerService } from 'src/engine/core-modules/record-transformer/services/record-input-transformer.service';
import { FieldMetadataMap } from 'src/engine/metadata-modules/types/field-metadata-map';

describe('QueryRunnerArgsFactory', () => {
  const recordPositionService = {
    buildRecordPosition: jest.fn().mockResolvedValue(2),
  };
  const workspaceId = 'workspaceId';
  const options = {
    authContext: { workspace: { id: workspaceId } },
    objectMetadataItemWithFieldMaps: {
      isCustom: true,
      nameSingular: 'testNumber',
      fieldsById: {
        'position-id': {
          type: FieldMetadataType.POSITION,
          isCustom: true,
          name: 'position',
        },
        'testNumber-id': {
          type: FieldMetadataType.NUMBER,
          isCustom: true,
          name: 'testNumber',
        },
        'otherField-id': {
          type: FieldMetadataType.TEXT,
          isCustom: true,
          name: 'otherField',
        },
      } as unknown as FieldMetadataMap,
      fieldIdByName: {
        position: 'position-id',
        testNumber: 'testNumber-id',
        otherField: 'otherField-id',
      },
      fieldIdByJoinColumnName: {},
    },
  } as unknown as WorkspaceQueryRunnerOptions;

  let factory: QueryRunnerArgsFactory;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QueryRunnerArgsFactory,
        RecordInputTransformerService,
        {
          provide: RecordPositionService,
          useValue: recordPositionService,
        },
      ],
    }).compile();

    factory = module.get<QueryRunnerArgsFactory>(QueryRunnerArgsFactory);
  });

  it('should be defined', () => {
    expect(factory).toBeDefined();
  });

  describe('create', () => {
    it('should simply return the args when data is an empty array', async () => {
      const args = {
        data: [],
      };
      const result = await factory.create(
        args,
        options,
        ResolverArgsType.CreateMany,
      );

      expect(result).toEqual(args);
    });

    it('createMany type should override data position and number', async () => {
      const args = {
        id: 'uuid',
        data: [{ position: 'last', testNumber: 1 }],
      };

      const result = await factory.create(
        args,
        options,
        ResolverArgsType.CreateMany,
      );

      const expectedArgs: RecordPositionServiceCreateArgs = {
        value: 'last',
        objectMetadata: { isCustom: true, nameSingular: 'testNumber' },
        workspaceId,
        index: 0,
      };

      expect(recordPositionService.buildRecordPosition).toHaveBeenCalledWith(
        expectedArgs,
      );
      expect(result).toEqual({
        id: 'uuid',
        data: [{ position: 2, testNumber: 1 }],
      });
    });

    it('createMany type should override position if not present', async () => {
      const args = {
        id: 'uuid',
        data: [{ testNumber: 1 }],
      };

      const result = await factory.create(
        args,
        options,
        ResolverArgsType.CreateMany,
      );

      const expectedArgs: RecordPositionServiceCreateArgs = {
        value: 'first',
        objectMetadata: { isCustom: true, nameSingular: 'testNumber' },
        workspaceId,
        index: 0,
      };

      expect(recordPositionService.buildRecordPosition).toHaveBeenCalledWith(
        expectedArgs,
      );
      expect(result).toEqual({
        id: 'uuid',
        data: [{ position: 2, testNumber: 1 }],
      });
    });

    it('findMany type should override data position and number', async () => {
      const args = {
        id: 'uuid',
        filter: { testNumber: { eq: 1 }, otherField: { eq: 'test' } },
      };

      const result = await factory.create(
        args,
        options,
        ResolverArgsType.FindMany,
      );

      expect(result).toEqual({
        id: 'uuid',
        filter: { testNumber: { eq: 1 }, otherField: { eq: 'test' } },
      });
    });

    it('findOne type should override number in filter', async () => {
      const args = {
        id: 'uuid',
        filter: { testNumber: { eq: 1 }, otherField: { eq: 'test' } },
      };

      const result = await factory.create(
        args,
        options,
        ResolverArgsType.FindOne,
      );

      expect(result).toEqual({
        id: 'uuid',
        filter: { testNumber: { eq: 1 }, otherField: { eq: 'test' } },
      });
    });

    it('findDuplicates type should override number in data and id', async () => {
      const args = {
        ids: [123],
        data: [{ testNumber: 1, otherField: 'test' }],
      };

      const result = await factory.create(
        args,
        options,
        ResolverArgsType.FindDuplicates,
      );

      expect(result).toEqual({
        ids: [123],
        data: [{ testNumber: 1, position: 2, otherField: 'test' }],
      });
    });
  });
});
