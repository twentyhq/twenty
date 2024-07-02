import { Test, TestingModule } from '@nestjs/testing';

import { LimitInputFactory } from 'src/engine/api/rest/input-factories/limit-input.factory';

describe('LimitInputFactory', () => {
  let service: LimitInputFactory;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LimitInputFactory],
    }).compile();

    service = module.get<LimitInputFactory>(LimitInputFactory);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should return default if limit missing', () => {
      const request: any = { query: {} };

      expect(service.create(request)).toEqual(60);
    });

    it('should return limit', () => {
      const request: any = { query: { limit: '10' } };

      expect(service.create(request)).toEqual(10);
    });

    it('should throw if not integer', () => {
      const request: any = { query: { limit: 'aaa' } };

      expect(() => service.create(request)).toThrow(
        "limit 'aaa' is invalid. Should be an integer",
      );
    });

    it('should throw if limit negative', () => {
      const request: any = { query: { limit: -1 } };

      expect(() => service.create(request)).toThrow(
        "limit '-1' is invalid. Should be an integer",
      );
    });
  });
});
