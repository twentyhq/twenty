import { Test, TestingModule } from '@nestjs/testing';
import { PostgresProviderService } from './postgres-provider.service';

describe('PostgresProviderService', () => {
  let service: PostgresProviderService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PostgresProviderService],
    }).compile();

    service = module.get<PostgresProviderService>(PostgresProviderService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  
  it('should initialize data sources without throwing synchronously', () => {
    // Basic test ensuring the map works
    expect(service['dataSources'].size).toBe(0);
  });
});
