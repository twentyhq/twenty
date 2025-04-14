import { Test, TestingModule } from '@nestjs/testing';

import { mockPersonObjectMetadata } from 'src/engine/api/graphql/graphql-query-runner/__mocks__/mockPersonObjectMetadata';
import { mockPersonRecords } from 'src/engine/api/graphql/graphql-query-runner/__mocks__/mockPersonRecords';
import { ProcessNestedRelationsHelper } from 'src/engine/api/graphql/graphql-query-runner/helpers/process-nested-relations.helper';
import { GraphqlQueryFindDuplicatesResolverService } from 'src/engine/api/graphql/graphql-query-runner/resolvers/graphql-query-find-duplicates-resolver.service';
import { ApiEventEmitterService } from 'src/engine/api/graphql/graphql-query-runner/services/api-event-emitter.service';
import { QueryResultGettersFactory } from 'src/engine/api/graphql/workspace-query-runner/factories/query-result-getters/query-result-getters.factory';
import { QueryRunnerArgsFactory } from 'src/engine/api/graphql/workspace-query-runner/factories/query-runner-args.factory';
import { WorkspaceQueryHookService } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/workspace-query-hook.service';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { PermissionsService } from 'src/engine/metadata-modules/permissions/permissions.service';
import { UserRoleService } from 'src/engine/metadata-modules/user-role/user-role.service';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';

describe('GraphqlQueryFindDuplicatesResolverService', () => {
  let service: GraphqlQueryFindDuplicatesResolverService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GraphqlQueryFindDuplicatesResolverService,
        WorkspaceQueryHookService,
        QueryRunnerArgsFactory,
        QueryResultGettersFactory,
        ApiEventEmitterService,
        TwentyORMGlobalManager,
        ProcessNestedRelationsHelper,
        FeatureFlagService,
        PermissionsService,
        UserRoleService,
      ],
    })
      .overrideProvider(WorkspaceQueryHookService)
      .useValue({})
      .overrideProvider(QueryRunnerArgsFactory)
      .useValue({})
      .overrideProvider(QueryResultGettersFactory)
      .useValue({})
      .overrideProvider(ApiEventEmitterService)
      .useValue({})
      .overrideProvider(TwentyORMGlobalManager)
      .useValue({})
      .overrideProvider(ProcessNestedRelationsHelper)
      .useValue({})
      .overrideProvider(FeatureFlagService)
      .useValue({})
      .overrideProvider(PermissionsService)
      .useValue({})
      .overrideProvider(UserRoleService)
      .useValue({})
      .compile();

    service = module.get<GraphqlQueryFindDuplicatesResolverService>(
      GraphqlQueryFindDuplicatesResolverService,
    );
  });

  describe('buildDuplicateConditions', () => {
    it('should build conditions based on duplicate criteria from composite field', () => {
      const duplicateConditons = service.buildDuplicateConditions(
        mockPersonObjectMetadata([['emailsPrimaryEmail']]),
        mockPersonRecords,
        'recordId',
      );

      expect(duplicateConditons).toEqual({
        or: [
          {
            emailsPrimaryEmail: {
              eq: 'test@test.fr',
            },
          },
        ],
        id: {
          neq: 'recordId',
        },
      });
    });

    it('should build conditions based on duplicate criteria from basic field', () => {
      const duplicateConditons = service.buildDuplicateConditions(
        mockPersonObjectMetadata([['jobTitle']]),
        mockPersonRecords,
        'recordId',
      );

      expect(duplicateConditons).toEqual({
        or: [
          {
            jobTitle: {
              eq: 'Test job',
            },
          },
        ],
        id: {
          neq: 'recordId',
        },
      });
    });

    it('should not build conditions based on duplicate criteria if record value is null or too small', () => {
      const duplicateConditons = service.buildDuplicateConditions(
        mockPersonObjectMetadata([['linkedinLinkPrimaryLinkUrl']]),
        mockPersonRecords,
        'recordId',
      );

      expect(duplicateConditons).toEqual({});
    });

    it('should build conditions based on duplicate criteria and without recordId filter', () => {
      const duplicateConditons = service.buildDuplicateConditions(
        mockPersonObjectMetadata([['jobTitle']]),
        mockPersonRecords,
      );

      expect(duplicateConditons).toEqual({
        or: [
          {
            jobTitle: {
              eq: 'Test job',
            },
          },
        ],
      });
    });
  });
});
