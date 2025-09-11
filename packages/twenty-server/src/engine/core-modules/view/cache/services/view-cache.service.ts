import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { ViewEntity } from 'src/engine/core-modules/view/entities/view.entity';
import { FlatViewMaps } from 'src/engine/core-modules/view/flat-view/types/flat-view-maps.type';
import { generateFlatViewMaps } from 'src/engine/core-modules/view/flat-view/utils/generate-flat-view-maps.util';

type GetExistingOrRecomputeFlatViewMapsResult = {
  flatViewMaps: FlatViewMaps;
};

@Injectable()
export class ViewCacheService {
  logger = new Logger(ViewCacheService.name);

  constructor(
    @InjectRepository(ViewEntity)
    private readonly viewRepository: Repository<ViewEntity>,
  ) {}

  async getExistingOrRecomputeFlatViewMaps({
    workspaceId,
  }: {
    workspaceId: string;
  }): Promise<GetExistingOrRecomputeFlatViewMapsResult> {
    // TODO: get from cache later
    const existingViews = await this.viewRepository.find({
      where: {
        workspaceId,
      },
      relations: ['viewFields'],
      select: {
        viewFields: {
          id: true,
        },
      },
    });

    const existingFlatViewMaps = generateFlatViewMaps(existingViews);

    return {
      flatViewMaps: existingFlatViewMaps,
    };
  }
}
