import { Test, TestingModule } from '@nestjs/testing';

import { WorkspaceQueryRunnerOptions } from 'src/engine/api/graphql/workspace-query-runner/interfaces/query-runner-option.interface';
import { FieldMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata.interface';

import { QueryRunnerArgsFactory } from 'src/engine/api/graphql/workspace-query-runner/factories/query-runner-args.factory';
import { FieldMetadataType } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { RecordPositionFactory } from 'src/engine/api/graphql/workspace-query-runner/factories/record-position.factory';

describe('QueryRunnerArgsFactory', () => {
  const recordPositionFactory = {
    create: jest.fn().mockResolvedValue(2),
  };
  const options = {
    fieldMetadataCollection: [
      { name: 'position', type: FieldMetadataType.POSITION },
    ] as FieldMetadataInterface[],
    objectMetadataItem: { isCustom: true, nameSingular: 'test' },
  } as WorkspaceQueryRunnerOptions;

  let factory: QueryRunnerArgsFactory;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QueryRunnerArgsFactory,
        {
          provide: RecordPositionFactory,
          useValue: {
            create: recordPositionFactory.create,
          },
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
      const result = await factory.create(args, options);

      expect(result).toEqual(args);
    });

    it('should override args when of type array', async () => {
      const args = { data: [{ id: 1 }, { position: 'last' }] };

      const result = await factory.create(args, options);

      expect(result).toEqual({
        data: [{ id: 1 }, { position: 2 }],
      });
    });
  });
});
