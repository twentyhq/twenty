import { TestingModule, Test } from '@nestjs/testing';

import { ArgsAliasFactory } from 'src/engine/api/graphql/workspace-query-builder/factories/args-alias.factory';
import { ArgsStringFactory } from 'src/engine/api/graphql/workspace-query-builder/factories/args-string.factory';

describe('ArgsStringFactory', () => {
  let service: ArgsStringFactory;
  const argsAliasCreate = jest.fn();

  beforeEach(async () => {
    jest.resetAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ArgsStringFactory,
        {
          provide: ArgsAliasFactory,
          useValue: {
            create: argsAliasCreate,
          },
        },
      ],
    }).compile();

    service = module.get<ArgsStringFactory>(ArgsStringFactory);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should return null when args are missing', () => {
      const args = undefined;

      const result = service.create(args, []);

      expect(result).toBeNull();
    });

    it('should return a string with the args when args are present', () => {
      const args = {
        id: '1',
        name: 'field_name',
      };

      argsAliasCreate.mockReturnValue(args);

      const result = service.create(args, []);

      expect(result).toEqual('id: "1", name: "field_name"');
    });

    it('should return a string with the args when args are present and the value is an object', () => {
      const args = {
        id: '1',
        name: {
          firstName: 'test',
        },
      };

      argsAliasCreate.mockReturnValue(args);

      const result = service.create(args, []);

      expect(result).toEqual('id: "1", name: {firstName:"test"}');
    });

    it('when orderBy is present, should return an array of objects', () => {
      const args = {
        orderBy: {
          id: 'AscNullsFirst',
          name: 'AscNullsFirst',
        },
      };

      argsAliasCreate.mockReturnValue(args);

      const result = service.create(args, []);

      expect(result).toEqual(
        'orderBy: [{id: AscNullsFirst}, {name: AscNullsFirst}]',
      );
    });

    it('when orderBy is present with position criteria, should return position at the end of the list', () => {
      const args = {
        orderBy: {
          position: 'AscNullsFirst',
          id: 'AscNullsFirst',
          name: 'AscNullsFirst',
        },
      };

      argsAliasCreate.mockReturnValue(args);

      const result = service.create(args, []);

      expect(result).toEqual(
        'orderBy: [{id: AscNullsFirst}, {name: AscNullsFirst}, {position: AscNullsFirst}]',
      );
    });

    it('when orderBy is present with position in the middle, should return position at the end of the list', () => {
      const args = {
        orderBy: {
          id: 'AscNullsFirst',
          position: 'AscNullsFirst',
          name: 'AscNullsFirst',
        },
      };

      argsAliasCreate.mockReturnValue(args);

      const result = service.create(args, []);

      expect(result).toEqual(
        'orderBy: [{id: AscNullsFirst}, {name: AscNullsFirst}, {position: AscNullsFirst}]',
      );
    });
  });
});
