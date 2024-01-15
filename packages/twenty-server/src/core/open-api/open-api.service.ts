import { Injectable } from '@nestjs/common';

import { Request } from 'express';
import { OpenAPIV3 } from 'openapi-types';

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

@Injectable()
export class OpenApiService {
  constructor(
    private readonly tokenService: TokenService,
    private readonly objectMetadataService: ObjectMetadataService,
  ) {}

  async generateSchema(request: Request): Promise<OpenAPIV3.Document> {
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
      paths[`/rest/${item.namePlural}`] = computeManyResultPath(item);
      paths[`/rest/${item.namePlural}/{id}`] = computeSingleResultPath(item);

      return paths;
    }, schema.paths as OpenAPIV3.PathsObject);

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
}
