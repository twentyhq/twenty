import { Test, TestingModule } from '@nestjs/testing';

import { EndingBeforeInputFactory } from 'src/engine/api/rest/input-factories/ending-before-input.factory';

describe('EndingBeforeInputFactory', () => {
  let service: EndingBeforeInputFactory;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EndingBeforeInputFactory],
    }).compile();

    service = module.get<EndingBeforeInputFactory>(EndingBeforeInputFactory);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should return default if ending_before missing', () => {
      const request: any = { query: {} };

      expect(service.create(request)).toEqual(undefined);
    });

    it('should return ending_before', () => {
      const request: any = { query: { ending_before: 'uuid' } };

      expect(service.create(request)).toEqual('uuid');
    });
  });
});
