import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { type APP_LOCALES, SOURCE_LOCALE } from 'twenty-shared/translations';
import { isDefined } from 'twenty-shared/utils';
import { IsNull, Repository } from 'typeorm';

import { I18nService } from 'src/engine/core-modules/i18n/i18n.service';
import { generateMessageId } from 'src/engine/core-modules/i18n/utils/generateMessageId';
import { ViewEntity } from 'src/engine/core-modules/view/entities/view.entity';
import {
  ViewException,
  ViewExceptionCode,
  ViewExceptionMessageKey,
  generateViewExceptionMessage,
  generateViewUserFriendlyExceptionMessage,
} from 'src/engine/core-modules/view/exceptions/view.exception';
import { WorkspaceCacheStorageService } from 'src/engine/workspace-cache-storage/workspace-cache-storage.service';

@Injectable()
export class ViewService {
  constructor(
    @InjectRepository(ViewEntity)
    private readonly viewRepository: Repository<ViewEntity>,
    private readonly i18nService: I18nService,
    private readonly workspaceCacheStorageService: WorkspaceCacheStorageService,
  ) {}

  async findByWorkspaceId(workspaceId: string): Promise<ViewEntity[]> {
    return this.viewRepository.find({
      where: {
        workspaceId,
        deletedAt: IsNull(),
      },
      order: { position: 'ASC' },
      relations: [
        'workspace',
        'viewFields',
        'viewFilters',
        'viewSorts',
        'viewGroups',
        'viewFilterGroups',
      ],
    });
  }

  async findByObjectMetadataId(
    workspaceId: string,
    objectMetadataId: string,
  ): Promise<ViewEntity[]> {
    return this.viewRepository.find({
      where: {
        workspaceId,
        objectMetadataId,
        deletedAt: IsNull(),
      },
      order: { position: 'ASC' },
      relations: [
        'workspace',
        'viewFields',
        'viewFilters',
        'viewSorts',
        'viewGroups',
        'viewFilterGroups',
      ],
    });
  }

  async findById(id: string, workspaceId: string): Promise<ViewEntity | null> {
    const view = await this.viewRepository.findOne({
      where: {
        id,
        workspaceId,
        deletedAt: IsNull(),
      },
      relations: [
        'workspace',
        'viewFields',
        'viewFilters',
        'viewSorts',
        'viewGroups',
        'viewFilterGroups',
      ],
    });

    return view || null;
  }

  async findByIdWithRelatedObjectMetadata(
    id: string,
    workspaceId: string,
  ): Promise<ViewEntity | null> {
    const view = await this.viewRepository.findOne({
      where: {
        id,
        workspaceId,
        deletedAt: IsNull(),
      },
      relations: ['workspace', 'objectMetadata', 'viewFields'],
    });

    return view || null;
  }

  async create(viewData: Partial<ViewEntity>): Promise<ViewEntity> {
    if (!isDefined(viewData.workspaceId)) {
      throw new ViewException(
        generateViewExceptionMessage(
          ViewExceptionMessageKey.WORKSPACE_ID_REQUIRED,
        ),
        ViewExceptionCode.INVALID_VIEW_DATA,
        {
          userFriendlyMessage: generateViewUserFriendlyExceptionMessage(
            ViewExceptionMessageKey.WORKSPACE_ID_REQUIRED,
          ),
        },
      );
    }

    if (!isDefined(viewData.objectMetadataId)) {
      throw new ViewException(
        generateViewExceptionMessage(
          ViewExceptionMessageKey.OBJECT_METADATA_ID_REQUIRED,
        ),
        ViewExceptionCode.INVALID_VIEW_DATA,
        {
          userFriendlyMessage: generateViewUserFriendlyExceptionMessage(
            ViewExceptionMessageKey.OBJECT_METADATA_ID_REQUIRED,
          ),
        },
      );
    }

    const view = this.viewRepository.create({
      ...viewData,
      isCustom: true,
    });

    const savedView = await this.viewRepository.save(view);

    await this.flushGraphQLCache(viewData.workspaceId);

    return savedView;
  }

  async update(
    id: string,
    workspaceId: string,
    updateData: Partial<ViewEntity>,
  ): Promise<ViewEntity> {
    const existingView = await this.findById(id, workspaceId);

    if (!isDefined(existingView)) {
      throw new ViewException(
        generateViewExceptionMessage(
          ViewExceptionMessageKey.VIEW_NOT_FOUND,
          id,
        ),
        ViewExceptionCode.VIEW_NOT_FOUND,
      );
    }

    const updatedView = await this.viewRepository.save({
      id,
      ...updateData,
    });

    await this.flushGraphQLCache(workspaceId);

    return { ...existingView, ...updatedView };
  }

  async delete(id: string, workspaceId: string): Promise<ViewEntity> {
    const view = await this.findById(id, workspaceId);

    if (!isDefined(view)) {
      throw new ViewException(
        generateViewExceptionMessage(
          ViewExceptionMessageKey.VIEW_NOT_FOUND,
          id,
        ),
        ViewExceptionCode.VIEW_NOT_FOUND,
      );
    }

    await this.viewRepository.softDelete(id);

    await this.flushGraphQLCache(workspaceId);

    return view;
  }

  async destroy(id: string, workspaceId: string): Promise<boolean> {
    const view = await this.findById(id, workspaceId);

    if (!isDefined(view)) {
      throw new ViewException(
        generateViewExceptionMessage(
          ViewExceptionMessageKey.VIEW_NOT_FOUND,
          id,
        ),
        ViewExceptionCode.VIEW_NOT_FOUND,
      );
    }

    await this.viewRepository.delete(id);
    await this.flushGraphQLCache(workspaceId);

    return true;
  }

  processViewNameWithTemplate(
    viewName: string,
    isCustom: boolean,
    objectLabelPlural?: string,
    locale?: keyof typeof APP_LOCALES,
  ): string {
    if (viewName.includes('{objectLabelPlural}') && objectLabelPlural) {
      const messageId = generateMessageId(viewName);
      const translatedTemplate = this.i18nService.translateMessage({
        messageId,
        values: {
          objectLabelPlural,
        },
        locale: locale ?? SOURCE_LOCALE,
      });

      if (translatedTemplate !== messageId) {
        return translatedTemplate;
      }

      return viewName.replace('{objectLabelPlural}', objectLabelPlural);
    }

    if (!isCustom) {
      const messageId = generateMessageId(viewName);
      const translatedMessage = this.i18nService.translateMessage({
        messageId,
        locale: locale ?? SOURCE_LOCALE,
      });

      if (translatedMessage !== messageId) {
        return translatedMessage;
      }
    }

    return viewName;
  }

  async flushGraphQLCache(workspaceId: string): Promise<void> {
    await this.workspaceCacheStorageService.flushGraphQLOperation({
      operationName: 'FindAllCoreViews',
      workspaceId,
    });
  }
}
