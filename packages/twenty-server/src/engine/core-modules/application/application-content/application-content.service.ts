import { Injectable } from '@nestjs/common';

import { basename, extname } from 'path';

import { FileFolder } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { Like } from 'typeorm';

import { type ApplicationContentDTO } from 'src/engine/core-modules/application/application-content/dtos/application-content.dto';
import {
  APPLICATION_CONTENT_FLAT_ENTITY_MAPS_KEYS,
  buildApplicationContentFromFlatEntityMaps,
} from 'src/engine/core-modules/application/application-content/utils/build-application-content-from-flat-entity-maps.util';
import { buildPublicAssetContentItem } from 'src/engine/core-modules/application/application-content/utils/build-public-asset-content-item.util';
import { buildTranslationContentItems } from 'src/engine/core-modules/application/application-content/utils/build-translation-content-items.util';
import { ApplicationTranslationCacheService } from 'src/engine/core-modules/application/application-translation/application-translation-cache.service';
import { FileEntity } from 'src/engine/core-modules/file/entities/file.entity';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

@Injectable()
export class ApplicationContentService {
  constructor(
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly applicationTranslationCacheService: ApplicationTranslationCacheService,
    @InjectWorkspaceScopedRepository(FileEntity)
    private readonly fileRepository: WorkspaceScopedRepository<FileEntity>,
  ) {}

  async getInstalledApplicationContent({
    workspaceId,
    applicationId,
    applicationRegistrationId,
  }: {
    workspaceId: string;
    applicationId: string;
    applicationRegistrationId?: string | null;
  }): Promise<ApplicationContentDTO> {
    const [flatEntityMaps, publicAssetFiles, catalogsByLocale] =
      await Promise.all([
        this.workspaceCacheService.getOrRecompute(workspaceId, [
          ...APPLICATION_CONTENT_FLAT_ENTITY_MAPS_KEYS,
        ]),
        this.fileRepository.find(workspaceId, {
          where: {
            applicationId,
            path: Like(`${FileFolder.PublicAsset}/%`),
          },
        }),
        isDefined(applicationRegistrationId)
          ? this.applicationTranslationCacheService.getCatalogsByLocale(
              applicationRegistrationId,
            )
          : Promise.resolve({}),
      ]);

    return {
      ...buildApplicationContentFromFlatEntityMaps({
        applicationId,
        flatEntityMaps,
      }),
      publicAssets: publicAssetFiles.map((file) =>
        buildPublicAssetContentItem({
          id: file.id,
          filePath: file.path,
          fileName: basename(file.path),
          fileType: extname(file.path).replace(/^\./, ''),
        }),
      ),
      translations: buildTranslationContentItems(catalogsByLocale),
    };
  }
}
