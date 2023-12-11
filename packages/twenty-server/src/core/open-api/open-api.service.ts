import { BadRequestException, Injectable } from '@nestjs/common';

import { Request } from 'express';

import { TokenService } from 'src/core/auth/services/token.service';
import { ObjectMetadataService } from 'src/metadata/object-metadata/object-metadata.service';
import { EnvironmentService } from 'src/integrations/environment/environment.service';
import { baseSchema } from 'src/core/open-api/utils/base-schema.utils';
import {
  computePath,
  computeSingleResultPath,
} from 'src/core/open-api/utils/compute-path.utils';

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
      paths[`/rest/${item.namePlural}`] = computePath(item);
      paths[`/rest/${item.namePlural}/{id}`] = computeSingleResultPath(item);

      return paths;
    }, {});

    return schema;
  }
}
