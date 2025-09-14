import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { ViewFieldEntity } from 'src/engine/core-modules/view/entities/view-field.entity';
import { ViewEntity } from 'src/engine/core-modules/view/entities/view.entity';
import { FlatViewFieldMaps } from 'src/engine/core-modules/view/flat-view/types/flat-view-field-maps.type';
import { FlatViewMaps } from 'src/engine/core-modules/view/flat-view/types/flat-view-maps.type';
import { fromViewFieldEntityToFlatViewField } from 'src/engine/core-modules/view/flat-view/utils/from-view-field-entity-to-flat-view-field.util';
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
    private readonly viewFieldRepository: Repository<ViewFieldEntity>,
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

  public async getExistingFlatViewFieldMapsFromCache({
    workspaceId,
  }: {
    workspaceId: string;
  }): Promise<{ flatViewFieldMaps: FlatViewFieldMaps }> {
    // TODO: get from cache later
    const existingViewFields = await this.viewFieldRepository.find({
      where: { workspaceId },
    });

    const flatViewFieldMaps: FlatViewFieldMaps = {
      byId: {},
      idByUniversalIdentifier: {},
    };

    for (const viewFieldEntity of existingViewFields) {
      const flatViewField = fromViewFieldEntityToFlatViewField(viewFieldEntity);

      flatViewFieldMaps.byId[flatViewField.id] = flatViewField;
      flatViewFieldMaps.idByUniversalIdentifier[
        flatViewField.universalIdentifier
      ] = flatViewField.id;
    }

    return { flatViewFieldMaps };
  }
}
