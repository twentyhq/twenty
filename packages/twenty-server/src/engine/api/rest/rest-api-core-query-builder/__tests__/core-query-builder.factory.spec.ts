import { Test, TestingModule } from '@nestjs/testing';

import { CoreQueryBuilderFactory } from 'src/engine/api/rest/rest-api-core-query-builder/core-query-builder.factory';
import { DeleteQueryFactory } from 'src/engine/api/rest/rest-api-core-query-builder/factories/delete-query.factory';
import { CreateOneQueryFactory } from 'src/engine/api/rest/rest-api-core-query-builder/factories/create-one-query.factory';
import { CreateManyQueryFactory } from 'src/engine/api/rest/rest-api-core-query-builder/factories/create-many-query.factory';
import { UpdateQueryFactory } from 'src/engine/api/rest/rest-api-core-query-builder/factories/update-query.factory';
import { FindOneQueryFactory } from 'src/engine/api/rest/rest-api-core-query-builder/factories/find-one-query.factory';
import { FindManyQueryFactory } from 'src/engine/api/rest/rest-api-core-query-builder/factories/find-many-query.factory';
import { DeleteVariablesFactory } from 'src/engine/api/rest/rest-api-core-query-builder/factories/delete-variables.factory';
import { CreateVariablesFactory } from 'src/engine/api/rest/rest-api-core-query-builder/factories/create-variables.factory';
import { UpdateVariablesFactory } from 'src/engine/api/rest/rest-api-core-query-builder/factories/update-variables.factory';
import { GetVariablesFactory } from 'src/engine/api/rest/rest-api-core-query-builder/factories/get-variables.factory';
import { ObjectMetadataService } from 'src/engine/metadata-modules/object-metadata/object-metadata.service';
import { TokenService } from 'src/engine/core-modules/auth/services/token.service';
import { EnvironmentService } from 'src/engine/integrations/environment/environment.service';

describe('CoreQueryBuilderFactory', () => {
  let service: CoreQueryBuilderFactory;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CoreQueryBuilderFactory,
        { provide: DeleteQueryFactory, useValue: {} },
        { provide: CreateOneQueryFactory, useValue: {} },
        { provide: CreateManyQueryFactory, useValue: {} },
        { provide: UpdateQueryFactory, useValue: {} },
        { provide: FindOneQueryFactory, useValue: {} },
        { provide: FindManyQueryFactory, useValue: {} },
        { provide: DeleteVariablesFactory, useValue: {} },
        { provide: CreateVariablesFactory, useValue: {} },
        { provide: UpdateVariablesFactory, useValue: {} },
        { provide: GetVariablesFactory, useValue: {} },
        { provide: ObjectMetadataService, useValue: {} },
        { provide: TokenService, useValue: {} },
        { provide: EnvironmentService, useValue: {} },
      ],
    }).compile();

    service = module.get<CoreQueryBuilderFactory>(CoreQueryBuilderFactory);
  });
  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
