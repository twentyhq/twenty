import { Injectable } from '@nestjs/common';

import { Request } from 'express';
import { OpenAPIV3_1 } from 'openapi-types';

import { TokenService } from 'src/core/auth/services/token.service';
import { ObjectMetadataService } from 'src/metadata/object-metadata/object-metadata.service';
import { baseSchema } from 'src/core/open-api/utils/base-schema.utils';
import {
  computeManyResultPath,
  computeSingleResultPath,
} from 'src/core/open-api/utils/path.utils';
import { getErrorResponses } from 'src/core/open-api/utils/get-error-responses.utils';
import {
  computeParameterComponents,
  computeSchemaComponents,
} from 'src/core/open-api/utils/components.utils';
import { computeSchemaTags } from 'src/core/open-api/utils/compute-schema-tags.utils';
import { computeWebhooks } from 'src/core/open-api/utils/computeWebhooks.utils';

@Injectable()
export class OpenApiService {
  constructor(
    private readonly tokenService: TokenService,
    private readonly objectMetadataService: ObjectMetadataService,
  ) {}

  async generateCoreSchema(request: Request): Promise<OpenAPIV3_1.Document> {
    const schema = baseSchema();

    let objectMetadataItems;

    try {
      const { workspace } = await this.tokenService.validateToken(request);

      objectMetadataItems =
        await this.objectMetadataService.findManyWithinWorkspace(workspace.id);
    } catch (err) {
      return schema;
    }

    if (!objectMetadataItems.length) {
      return schema;
    }
    schema.paths = objectMetadataItems.reduce((paths, item) => {
      paths[`/${item.namePlural}`] = computeManyResultPath(item);
      paths[`/${item.namePlural}/{id}`] = computeSingleResultPath(item);

      return paths;
    }, schema.paths as OpenAPIV3_1.PathsObject);

    schema.webhooks = objectMetadataItems.reduce(
      (paths, item) => {
        paths[`Create ${item.nameSingular}`] = computeWebhooks('create', item);
        paths[`Update ${item.nameSingular}`] = computeWebhooks('update', item);
        paths[`Delete ${item.nameSingular}`] = computeWebhooks('delete', item);

        return paths;
      },
      {} as Record<
        string,
        OpenAPIV3_1.PathItemObject | OpenAPIV3_1.ReferenceObject
      >,
    );

    schema.tags = computeSchemaTags(objectMetadataItems);

    schema.components = {
      ...schema.components, // components.securitySchemes is defined in base Schema
      schemas: computeSchemaComponents(objectMetadataItems),
      parameters: computeParameterComponents(),
      responses: {
        '400': getErrorResponses('Invalid request'),
        '401': getErrorResponses('Unauthorized'),
      },
    };

    return schema;
  }

  async generateMetaDataSchema(): Promise<OpenAPIV3_1.Document> {
    //TODO Add once Rest MetaData api is ready
    const schema = baseSchema();

    schema.tags = [{ name: 'placeholder' }];

    return schema;
  }
}
