import { Test, TestingModule } from '@nestjs/testing';

import { StartingAfterInputFactory } from 'src/engine/api/rest/input-factories/starting-after-input.factory';

describe('StartingAfterInputFactory', () => {
  let service: StartingAfterInputFactory;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StartingAfterInputFactory],
    }).compile();

    service = module.get<StartingAfterInputFactory>(StartingAfterInputFactory);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should return default if starting_after missing', () => {
      const request: any = { query: {} };

      expect(service.create(request)).toEqual(undefined);
    });

    it('should return starting_after', () => {
      const request: any = { query: { starting_after: 'uuid' } };

      expect(service.create(request)).toEqual('uuid');
    });
  });
});
