import { Test, TestingModule } from '@nestjs/testing';

import { ApiRestQueryBuilderFactory } from 'src/engine/api/rest/api-rest-query-builder/api-rest-query-builder.factory';
import { DeleteQueryFactory } from 'src/engine/api/rest/api-rest-query-builder/factories/delete-query.factory';
import { CreateQueryFactory } from 'src/engine/api/rest/api-rest-query-builder/factories/create-query.factory';
import { UpdateQueryFactory } from 'src/engine/api/rest/api-rest-query-builder/factories/update-query.factory';
import { FindOneQueryFactory } from 'src/engine/api/rest/api-rest-query-builder/factories/find-one-query.factory';
import { FindManyQueryFactory } from 'src/engine/api/rest/api-rest-query-builder/factories/find-many-query.factory';
import { DeleteVariablesFactory } from 'src/engine/api/rest/api-rest-query-builder/factories/delete-variables.factory';
import { CreateVariablesFactory } from 'src/engine/api/rest/api-rest-query-builder/factories/create-variables.factory';
import { UpdateVariablesFactory } from 'src/engine/api/rest/api-rest-query-builder/factories/update-variables.factory';
import { GetVariablesFactory } from 'src/engine/api/rest/api-rest-query-builder/factories/get-variables.factory';
import { ObjectMetadataService } from 'src/engine/metadata-modules/object-metadata/object-metadata.service';
import { TokenService } from 'src/engine/core-modules/auth/services/token.service';
import { EnvironmentService } from 'src/engine/integrations/environment/environment.service';

describe('ApiRestQueryBuilderFactory', () => {
  let service: ApiRestQueryBuilderFactory;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApiRestQueryBuilderFactory,
        { provide: DeleteQueryFactory, useValue: {} },
        { provide: CreateQueryFactory, useValue: {} },
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

    service = module.get<ApiRestQueryBuilderFactory>(
      ApiRestQueryBuilderFactory,
    );
  });
  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
