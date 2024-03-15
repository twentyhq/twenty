import { Test, TestingModule } from '@nestjs/testing';

import { LastCursorInputFactory } from 'src/engine/api/rest/api-rest-query-builder/factories/input-factories/last-cursor-input.factory';

describe('LastCursorInputFactory', () => {
  let service: LastCursorInputFactory;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LastCursorInputFactory],
    }).compile();

    service = module.get<LastCursorInputFactory>(LastCursorInputFactory);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should return default if last_cursor missing', () => {
      const request: any = { query: {} };

      expect(service.create(request)).toEqual(undefined);
    });

    it('should return last_cursor', () => {
      const request: any = { query: { last_cursor: 'uuid' } };

      expect(service.create(request)).toEqual('uuid');
    });
  });
});
