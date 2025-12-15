import { Injectable } from '@nestjs/common';

import { type Request } from 'express';
import { type OpenAPIV3_1 } from 'openapi-types';
import {
  assertIsDefinedOrThrow,
  capitalize,
  isDefined,
} from 'twenty-shared/utils';

import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';
import { AccessTokenService } from 'src/engine/core-modules/auth/token/services/access-token.service';
import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { baseSchema } from 'src/engine/core-modules/open-api/utils/base-schema.utils';
import {
  computeMetadataSchemaComponents,
  computeParameterComponents,
  computeSchemaComponents,
} from 'src/engine/core-modules/open-api/utils/components.utils';
import { computeSchemaTags } from 'src/engine/core-modules/open-api/utils/compute-schema-tags.utils';
import { computeWebhooks } from 'src/engine/core-modules/open-api/utils/computeWebhooks.utils';
import {
  get400ErrorResponses,
  get401ErrorResponses,
} from 'src/engine/core-modules/open-api/utils/get-error-responses.utils';
import {
  computeBatchPath,
  computeDuplicatesResultPath,
  computeManyResultPath,
  computeMergeManyResultPath,
  computeRestoreManyResultPath,
  computeRestoreOneResultPath,
  computeSingleResultPath,
} from 'src/engine/core-modules/open-api/utils/path.utils';
import {
  getRequestBody,
  getUpdateRequestBody,
} from 'src/engine/core-modules/open-api/utils/request-body.utils';
import {
  getCreateOneResponse201,
  getDeleteResponse200,
  getFindManyResponse200,
  getFindOneResponse200,
  getUpdateOneResponse200,
} from 'src/engine/core-modules/open-api/utils/responses.utils';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { WorkspaceNotFoundDefaultError } from 'src/engine/core-modules/workspace/workspace.exception';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { standardObjectMetadataDefinitions } from 'src/engine/workspace-manager/workspace-sync-metadata/standard-objects';
import { shouldExcludeFromWorkspaceApi } from 'src/engine/workspace-manager/workspace-sync-metadata/utils/should-exclude-from-workspace-api.util';
import { getServerUrl } from 'src/utils/get-server-url';

@Injectable()
export class OpenApiService {
  constructor(
    private readonly accessTokenService: AccessTokenService,
    private readonly twentyConfigService: TwentyConfigService,
    private readonly flatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
    private readonly featureFlagService: FeatureFlagService,
  ) {}

  private async getWorkspaceFromRequest(request: Request) {
    try {
      const { workspace } =
        await this.accessTokenService.validateTokenByRequest(request);

      assertIsDefinedOrThrow(workspace, WorkspaceNotFoundDefaultError);

      return workspace;
    } catch {
      return null;
    }
  }

  private async getFlatObjectMetadataArray(workspaceId: string) {
    const { flatObjectMetadataMaps, flatFieldMetadataMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatObjectMetadataMaps', 'flatFieldMetadataMaps'],
        },
      );

    const flatObjectMetadataArray = Object.values(
      flatObjectMetadataMaps.byId,
    ).filter(isDefined);

    flatObjectMetadataArray.sort((a, b) =>
      a.namePlural.localeCompare(b.namePlural),
    );

    return {
      flatObjectMetadataArray,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
    };
  }

  async generateCoreSchema(request: Request): Promise<OpenAPIV3_1.Document> {
    const baseUrl = getServerUrl({
      serverUrlEnv: this.twentyConfigService.get('SERVER_URL'),
      serverUrlFallback: `${request.protocol}://${request.get('host')}`,
    });

    const tokenFromQuery = request.query.token;
    const schema = baseSchema(
      'core',
      baseUrl,
      typeof tokenFromQuery === 'string' ? tokenFromQuery : undefined,
    );

    const workspace = await this.getWorkspaceFromRequest(request);

    if (!isDefined(workspace)) {
      return schema;
    }

    const {
      flatObjectMetadataArray,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
    } = await this.getFlatObjectMetadataArray(workspace.id);

    if (!flatObjectMetadataArray.length) {
      return schema;
    }

    const workspaceFeatureFlagsMap =
      await this.featureFlagService.getWorkspaceFeatureFlagsMap(workspace.id);

    const filteredObjectMetadataItems = flatObjectMetadataArray.filter(
      (item) => {
        return !shouldExcludeFromWorkspaceApi(
          item,
          standardObjectMetadataDefinitions,
          workspaceFeatureFlagsMap,
        );
      },
    );

    schema.paths = filteredObjectMetadataItems.reduce((paths, item) => {
      paths[`/${item.namePlural}`] = computeManyResultPath(
        item,
        flatObjectMetadataMaps,
        flatFieldMetadataMaps,
      );
      paths[`/batch/${item.namePlural}`] = computeBatchPath(
        item,
        flatObjectMetadataMaps,
        flatFieldMetadataMaps,
      );
      paths[`/${item.namePlural}/{id}`] = computeSingleResultPath(
        item,
        flatObjectMetadataMaps,
        flatFieldMetadataMaps,
      );
      paths[`/${item.namePlural}/duplicates`] = computeDuplicatesResultPath(
        item,
        flatObjectMetadataMaps,
        flatFieldMetadataMaps,
      );
      paths[`/restore/${item.namePlural}/{id}`] = computeRestoreOneResultPath(
        item,
        flatObjectMetadataMaps,
        flatFieldMetadataMaps,
      );
      paths[`/restore/${item.namePlural}`] = computeRestoreManyResultPath(
        item,
        flatObjectMetadataMaps,
        flatFieldMetadataMaps,
      );
      paths[`/${item.namePlural}/merge`] = computeMergeManyResultPath(
        item,
        flatObjectMetadataMaps,
        flatFieldMetadataMaps,
      );

      return paths;
    }, schema.paths as OpenAPIV3_1.PathsObject);

    schema.paths['/dashboards/{id}/duplicate'] = {
      post: {
        tags: ['dashboards'],
        summary: 'Duplicate a dashboard',
        description: 'Creates a duplicate of an existing dashboard',
        operationId: 'duplicateDashboard',
        parameters: [{ $ref: '#/components/parameters/idPath' }],
        responses: {
          '201': {
            description: 'Dashboard duplicated successfully',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/DashboardForResponse',
                },
              },
            },
          },
          '400': { $ref: '#/components/responses/400' },
          '401': { $ref: '#/components/responses/401' },
        },
      },
    } as OpenAPIV3_1.PathItemObject;

    schema.webhooks = filteredObjectMetadataItems.reduce(
      (paths, item) => {
        paths[
          this.createWebhookEventName(
            DatabaseEventAction.CREATED,
            item.nameSingular,
          )
        ] = computeWebhooks(
          DatabaseEventAction.CREATED,
          item,
          flatObjectMetadataMaps,
          flatFieldMetadataMaps,
        );
        paths[
          this.createWebhookEventName(
            DatabaseEventAction.UPDATED,
            item.nameSingular,
          )
        ] = computeWebhooks(
          DatabaseEventAction.UPDATED,
          item,
          flatObjectMetadataMaps,
          flatFieldMetadataMaps,
        );
        paths[
          this.createWebhookEventName(
            DatabaseEventAction.DELETED,
            item.nameSingular,
          )
        ] = computeWebhooks(
          DatabaseEventAction.DELETED,
          item,
          flatObjectMetadataMaps,
          flatFieldMetadataMaps,
        );

        return paths;
      },
      {} as Record<
        string,
        OpenAPIV3_1.PathItemObject | OpenAPIV3_1.ReferenceObject
      >,
    );

    schema.components = {
      ...schema.components, // components.securitySchemes is defined in base Schema
      schemas: computeSchemaComponents(
        filteredObjectMetadataItems,
        flatObjectMetadataMaps,
        flatFieldMetadataMaps,
      ),
      parameters: computeParameterComponents(),
      responses: {
        '400': get400ErrorResponses(),
        '401': get401ErrorResponses(),
      },
    };

    schema.tags = computeSchemaTags(filteredObjectMetadataItems);

    return schema;
  }

  async generateMetaDataSchema(
    request: Request,
  ): Promise<OpenAPIV3_1.Document> {
    const baseUrl = getServerUrl({
      serverUrlEnv: this.twentyConfigService.get('SERVER_URL'),
      serverUrlFallback: `${request.protocol}://${request.get('host')}`,
    });

    const tokenFromQuery = request.query.token;
    const schema = baseSchema(
      'metadata',
      baseUrl,
      typeof tokenFromQuery === 'string' ? tokenFromQuery : undefined,
    );

    const workspace = await this.getWorkspaceFromRequest(request);

    if (!isDefined(workspace)) {
      return schema;
    }

    const workspaceFeatureFlagsMap =
      await this.featureFlagService.getWorkspaceFeatureFlagsMap(workspace.id);

    const isPageLayoutEnabled =
      workspaceFeatureFlagsMap[FeatureFlagKey.IS_PAGE_LAYOUT_ENABLED];

    const metadata = [
      {
        nameSingular: 'object',
        namePlural: 'objects',
      },
      {
        nameSingular: 'field',
        namePlural: 'fields',
      },
      {
        nameSingular: 'webhook',
        namePlural: 'webhooks',
      },
      {
        nameSingular: 'apiKey',
        namePlural: 'apiKeys',
      },
      {
        nameSingular: 'view',
        namePlural: 'views',
      },
      {
        nameSingular: 'viewField',
        namePlural: 'viewFields',
      },
      {
        nameSingular: 'viewFilter',
        namePlural: 'viewFilters',
      },
      {
        nameSingular: 'viewSort',
        namePlural: 'viewSorts',
      },
      {
        nameSingular: 'viewGroup',
        namePlural: 'viewGroups',
      },
      {
        nameSingular: 'viewFilterGroup',
        namePlural: 'viewFilterGroups',
      },
      ...(isPageLayoutEnabled
        ? [
            {
              nameSingular: 'pageLayout',
              namePlural: 'pageLayouts',
            },
            {
              nameSingular: 'pageLayoutTab',
              namePlural: 'pageLayoutTabs',
            },
            {
              nameSingular: 'pageLayoutWidget',
              namePlural: 'pageLayoutWidgets',
            },
          ]
        : []),
    ];

    schema.paths = metadata.reduce((path, item) => {
      path[`/${item.namePlural}`] = {
        get: {
          tags: [item.namePlural],
          summary: `Find Many ${item.namePlural}`,
          parameters: [
            { $ref: '#/components/parameters/limit' },
            { $ref: '#/components/parameters/startingAfter' },
            { $ref: '#/components/parameters/endingBefore' },
          ],
          responses: {
            '200': getFindManyResponse200(item, true),
            '400': { $ref: '#/components/responses/400' },
            '401': { $ref: '#/components/responses/401' },
          },
        },
        post: {
          tags: [item.namePlural],
          summary: `Create One ${item.nameSingular}`,
          operationId: `createOne${capitalize(item.nameSingular)}`,
          requestBody: getRequestBody(capitalize(item.nameSingular)),
          responses: {
            '200': getCreateOneResponse201(item, true),
            '400': { $ref: '#/components/responses/400' },
            '401': { $ref: '#/components/responses/401' },
          },
        },
      } as OpenAPIV3_1.PathItemObject;
      path[`/${item.namePlural}/{id}`] = {
        delete: {
          tags: [item.namePlural],
          summary: `Delete One ${item.nameSingular}`,
          operationId: `deleteOne${capitalize(item.nameSingular)}`,
          parameters: [{ $ref: '#/components/parameters/idPath' }],
          responses: {
            '200': getDeleteResponse200(item, true),
            '400': { $ref: '#/components/responses/400' },
            '401': { $ref: '#/components/responses/401' },
          },
        },
        get: {
          tags: [item.namePlural],
          summary: `Find One ${item.nameSingular}`,
          parameters: [{ $ref: '#/components/parameters/idPath' }],
          responses: {
            '200': getFindOneResponse200(item),
            '400': { $ref: '#/components/responses/400' },
            '401': { $ref: '#/components/responses/401' },
          },
        },
        patch: {
          tags: [item.namePlural],
          summary: `Update One ${item.nameSingular}`,
          operationId: `updateOne${capitalize(item.nameSingular)}`,
          parameters: [{ $ref: '#/components/parameters/idPath' }],
          requestBody: getUpdateRequestBody(capitalize(item.nameSingular)),
          responses: {
            '200': getUpdateOneResponse200(item, true),
            '400': { $ref: '#/components/responses/400' },
            '401': { $ref: '#/components/responses/401' },
          },
        },
      } as OpenAPIV3_1.PathItemObject;

      return path;
    }, schema.paths as OpenAPIV3_1.PathsObject);

    schema.components = {
      ...schema.components, // components.securitySchemes is defined in base Schema
      schemas: computeMetadataSchemaComponents(metadata),
      parameters: computeParameterComponents(true),
      responses: {
        '400': get400ErrorResponses(),
        '401': get401ErrorResponses(),
      },
    };

    schema.tags = computeSchemaTags(
      metadata.map((item) => ({
        nameSingular: item.nameSingular,
        namePlural: item.namePlural,
      })) as FlatObjectMetadata[],
    );

    return schema;
  }

  createWebhookEventName(
    action: DatabaseEventAction,
    objectName: string,
  ): string {
    return `${capitalize(objectName)} ${capitalize(action)}`;
  }
}
