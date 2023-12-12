import { BadRequestException, Injectable } from '@nestjs/common';

import { Request } from 'express';

import { TokenService } from 'src/core/auth/services/token.service';
import { ObjectMetadataService } from 'src/metadata/object-metadata/object-metadata.service';
import { EnvironmentService } from 'src/integrations/environment/environment.service';
import { baseSchema } from 'src/core/open-api/utils/base-schema.utils';
import {
  computeManyResultPath,
  computeOpenApiPath,
  computeSingleResultPath,
} from 'src/core/open-api/utils/path.utils';
import { capitalize } from 'src/utils/capitalize';
import { getErrorResponses } from 'src/core/open-api/utils/get-error-responses.utils';
import { computeSchemaComponents } from 'src/core/open-api/utils/components.utils';
import { computeSchemaTags } from 'src/core/open-api/utils/compute-schema-tags.utils';

@Injectable()
export class OpenApiService {
  constructor(
    private readonly tokenService: TokenService,
    private readonly objectMetadataService: ObjectMetadataService,
    private readonly environmentService: EnvironmentService,
  ) {}

  async generateSchema(request: Request) {
    const workspace = await this.tokenService.validateToken(request);

    const objectMetadataItems =
      await this.objectMetadataService.findManyWithinWorkspace(workspace.id);

    if (!objectMetadataItems.length) {
      throw new BadRequestException(`No object found`);
    }

    const schema = baseSchema(this.environmentService.getFrontBaseUrl());

    schema.paths = objectMetadataItems.reduce((paths, item) => {
      paths[`/rest/${item.namePlural}`] = computeManyResultPath(item);
      paths[`/rest/${item.namePlural}/{id}`] = computeSingleResultPath(item);
      paths['/open-api'] = computeOpenApiPath();

      return paths;
    }, {});

    schema.tags = computeSchemaTags(objectMetadataItems);

    schema.components.schemas = objectMetadataItems.reduce((schemas, item) => {
      schemas[capitalize(item.nameSingular)] = computeSchemaComponents(item);

      return schemas;
    }, {});

    schema.components['responses'] = {
      '400': getErrorResponses('Invalid request'),
      '401': getErrorResponses('Unauthorized'),
    };

    return schema;
  }
}
