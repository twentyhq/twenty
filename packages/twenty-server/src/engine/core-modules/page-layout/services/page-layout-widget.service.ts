import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { ObjectsPermissions } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { EntityManager, IsNull, Repository } from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

import { ApiKeyRoleService } from 'src/engine/core-modules/api-key/api-key-role.service';
import { CreatePageLayoutWidgetInput } from 'src/engine/core-modules/page-layout/dtos/inputs/create-page-layout-widget.input';
import { UpdatePageLayoutWidgetInput } from 'src/engine/core-modules/page-layout/dtos/inputs/update-page-layout-widget.input';
import { PageLayoutWidgetDTO } from 'src/engine/core-modules/page-layout/dtos/page-layout-widget.dto';
import { PageLayoutWidgetEntity } from 'src/engine/core-modules/page-layout/entities/page-layout-widget.entity';
import {
  PageLayoutTabException,
  PageLayoutTabExceptionCode,
} from 'src/engine/core-modules/page-layout/exceptions/page-layout-tab.exception';
import {
  PageLayoutWidgetException,
  PageLayoutWidgetExceptionCode,
  PageLayoutWidgetExceptionMessageKey,
  generatePageLayoutWidgetExceptionMessage,
} from 'src/engine/core-modules/page-layout/exceptions/page-layout-widget.exception';
import { PageLayoutTabService } from 'src/engine/core-modules/page-layout/services/page-layout-tab.service';
import { applyPermissionsToWidget } from 'src/engine/core-modules/page-layout/utils/apply-permissions-to-widget.util';
import { UserRoleService } from 'src/engine/metadata-modules/user-role/user-role.service';
import { WorkspacePermissionsCacheService } from 'src/engine/metadata-modules/workspace-permissions-cache/workspace-permissions-cache.service';

@Injectable()
export class PageLayoutWidgetService {
  constructor(
    @InjectRepository(PageLayoutWidgetEntity)
    private readonly pageLayoutWidgetRepository: Repository<PageLayoutWidgetEntity>,
    private readonly pageLayoutTabService: PageLayoutTabService,
    private readonly userRoleService: UserRoleService,
    private readonly workspacePermissionsCacheService: WorkspacePermissionsCacheService,
    private readonly apiKeyRoleService: ApiKeyRoleService,
  ) {}

  private getPageLayoutWidgetRepository(
    transactionManager?: EntityManager,
  ): Repository<PageLayoutWidgetEntity> {
    return transactionManager
      ? transactionManager.getRepository(PageLayoutWidgetEntity)
      : this.pageLayoutWidgetRepository;
  }

  async findByPageLayoutTabId(
    workspaceId: string,
    pageLayoutTabId: string,
    transactionManager?: EntityManager,
  ): Promise<PageLayoutWidgetEntity[]> {
    const repository = this.getPageLayoutWidgetRepository(transactionManager);

    return repository.find({
      where: {
        pageLayoutTabId,
        workspaceId,
        deletedAt: IsNull(),
      },
      order: { createdAt: 'ASC' },
    });
  }

  async findByIdOrThrow(
    id: string,
    workspaceId: string,
    transactionManager?: EntityManager,
  ): Promise<PageLayoutWidgetEntity> {
    const repository = this.getPageLayoutWidgetRepository(transactionManager);

    const pageLayoutWidget = await repository.findOne({
      where: {
        id,
        workspaceId,
        deletedAt: IsNull(),
      },
    });

    if (!isDefined(pageLayoutWidget)) {
      throw new PageLayoutWidgetException(
        generatePageLayoutWidgetExceptionMessage(
          PageLayoutWidgetExceptionMessageKey.PAGE_LAYOUT_WIDGET_NOT_FOUND,
          id,
        ),
        PageLayoutWidgetExceptionCode.PAGE_LAYOUT_WIDGET_NOT_FOUND,
      );
    }

    return pageLayoutWidget;
  }

  async create(
    pageLayoutWidgetData: CreatePageLayoutWidgetInput,
    workspaceId: string,
    transactionManager?: EntityManager,
  ): Promise<PageLayoutWidgetEntity> {
    if (!isDefined(pageLayoutWidgetData.title)) {
      throw new PageLayoutWidgetException(
        generatePageLayoutWidgetExceptionMessage(
          PageLayoutWidgetExceptionMessageKey.TITLE_REQUIRED,
        ),
        PageLayoutWidgetExceptionCode.INVALID_PAGE_LAYOUT_WIDGET_DATA,
      );
    }

    if (!isDefined(pageLayoutWidgetData.pageLayoutTabId)) {
      throw new PageLayoutWidgetException(
        generatePageLayoutWidgetExceptionMessage(
          PageLayoutWidgetExceptionMessageKey.PAGE_LAYOUT_TAB_ID_REQUIRED,
        ),
        PageLayoutWidgetExceptionCode.INVALID_PAGE_LAYOUT_WIDGET_DATA,
      );
    }

    if (!isDefined(pageLayoutWidgetData.gridPosition)) {
      throw new PageLayoutWidgetException(
        generatePageLayoutWidgetExceptionMessage(
          PageLayoutWidgetExceptionMessageKey.GRID_POSITION_REQUIRED,
        ),
        PageLayoutWidgetExceptionCode.INVALID_PAGE_LAYOUT_WIDGET_DATA,
      );
    }

    try {
      await this.pageLayoutTabService.findByIdOrThrow(
        pageLayoutWidgetData.pageLayoutTabId,
        workspaceId,
        transactionManager,
      );

      const repository = this.getPageLayoutWidgetRepository(transactionManager);

      const insertResult = await repository.insert({
        ...pageLayoutWidgetData,
        workspaceId,
      } as QueryDeepPartialEntity<PageLayoutWidgetEntity>);

      return this.findByIdOrThrow(
        insertResult.identifiers[0].id,
        workspaceId,
        transactionManager,
      );
    } catch (error) {
      if (
        error instanceof PageLayoutTabException &&
        error.code === PageLayoutTabExceptionCode.PAGE_LAYOUT_TAB_NOT_FOUND
      ) {
        throw new PageLayoutWidgetException(
          generatePageLayoutWidgetExceptionMessage(
            PageLayoutWidgetExceptionMessageKey.PAGE_LAYOUT_TAB_NOT_FOUND,
          ),
          PageLayoutWidgetExceptionCode.INVALID_PAGE_LAYOUT_WIDGET_DATA,
        );
      }
      throw error;
    }
  }

  async update(
    id: string,
    workspaceId: string,
    updateData: UpdatePageLayoutWidgetInput,
    transactionManager?: EntityManager,
  ): Promise<PageLayoutWidgetEntity> {
    const repository = this.getPageLayoutWidgetRepository(transactionManager);

    const existingWidget = await repository.findOne({
      where: {
        id,
        workspaceId,
        deletedAt: IsNull(),
      },
    });

    if (!isDefined(existingWidget)) {
      throw new PageLayoutWidgetException(
        generatePageLayoutWidgetExceptionMessage(
          PageLayoutWidgetExceptionMessageKey.PAGE_LAYOUT_WIDGET_NOT_FOUND,
          id,
        ),
        PageLayoutWidgetExceptionCode.PAGE_LAYOUT_WIDGET_NOT_FOUND,
      );
    }

    await repository.update(
      { id },
      updateData as QueryDeepPartialEntity<PageLayoutWidgetEntity>,
    );

    return this.findByIdOrThrow(id, workspaceId, transactionManager);
  }

  async delete(
    id: string,
    workspaceId: string,
    transactionManager?: EntityManager,
  ): Promise<PageLayoutWidgetEntity> {
    const pageLayoutWidget = await this.findByIdOrThrow(
      id,
      workspaceId,
      transactionManager,
    );

    const repository = this.getPageLayoutWidgetRepository(transactionManager);

    await repository.softDelete(id);

    return pageLayoutWidget;
  }

  async destroy(
    id: string,
    workspaceId: string,
    transactionManager?: EntityManager,
  ): Promise<boolean> {
    const repository = this.getPageLayoutWidgetRepository(transactionManager);

    const pageLayoutWidget = await repository.findOne({
      where: {
        id,
        workspaceId,
      },
      withDeleted: true,
    });

    if (!isDefined(pageLayoutWidget)) {
      throw new PageLayoutWidgetException(
        generatePageLayoutWidgetExceptionMessage(
          PageLayoutWidgetExceptionMessageKey.PAGE_LAYOUT_WIDGET_NOT_FOUND,
          id,
        ),
        PageLayoutWidgetExceptionCode.PAGE_LAYOUT_WIDGET_NOT_FOUND,
      );
    }

    await repository.delete(id);

    return true;
  }

  async restore(
    id: string,
    workspaceId: string,
    transactionManager?: EntityManager,
  ): Promise<PageLayoutWidgetEntity> {
    const repository = this.getPageLayoutWidgetRepository(transactionManager);

    const pageLayoutWidget = await repository.findOne({
      select: {
        id: true,
        deletedAt: true,
        pageLayoutTabId: true,
      },
      where: {
        id,
        workspaceId,
      },
      withDeleted: true,
    });

    if (!isDefined(pageLayoutWidget)) {
      throw new PageLayoutWidgetException(
        generatePageLayoutWidgetExceptionMessage(
          PageLayoutWidgetExceptionMessageKey.PAGE_LAYOUT_WIDGET_NOT_FOUND,
          id,
        ),
        PageLayoutWidgetExceptionCode.PAGE_LAYOUT_WIDGET_NOT_FOUND,
      );
    }

    if (!isDefined(pageLayoutWidget.deletedAt)) {
      throw new PageLayoutWidgetException(
        generatePageLayoutWidgetExceptionMessage(
          PageLayoutWidgetExceptionMessageKey.PAGE_LAYOUT_WIDGET_NOT_DELETED,
        ),
        PageLayoutWidgetExceptionCode.INVALID_PAGE_LAYOUT_WIDGET_DATA,
      );
    }

    try {
      await this.pageLayoutTabService.findByIdOrThrow(
        pageLayoutWidget.pageLayoutTabId,
        workspaceId,
        transactionManager,
      );
    } catch (error) {
      if (
        error instanceof PageLayoutTabException &&
        error.code === PageLayoutTabExceptionCode.PAGE_LAYOUT_TAB_NOT_FOUND
      ) {
        throw new PageLayoutWidgetException(
          generatePageLayoutWidgetExceptionMessage(
            PageLayoutWidgetExceptionMessageKey.PAGE_LAYOUT_TAB_NOT_FOUND,
          ),
          PageLayoutWidgetExceptionCode.INVALID_PAGE_LAYOUT_WIDGET_DATA,
        );
      }
      throw error;
    }

    await repository.restore(id);

    const restoredPageLayoutWidget = await this.findByIdOrThrow(
      id,
      workspaceId,
      transactionManager,
    );

    return restoredPageLayoutWidget;
  }

  private async getUserPermissions(
    workspaceId: string,
    userWorkspaceId: string,
    apiKeyId?: string,
  ) {
    if (apiKeyId) {
      const roleId = await this.apiKeyRoleService.getRoleIdForApiKey(
        apiKeyId,
        workspaceId,
      );

      const { data: rolesPermissions } =
        await this.workspacePermissionsCacheService.getRolesPermissionsFromCache(
          {
            workspaceId,
          },
        );

      return rolesPermissions[roleId] ?? {};
    }

    if (userWorkspaceId) {
      const [userRole] = await this.userRoleService
        .getRolesByUserWorkspaces({
          userWorkspaceIds: [userWorkspaceId],
          workspaceId,
        })
        .then((roles) => roles?.get(userWorkspaceId) ?? []);

      if (!userRole) {
        return null;
      }

      const { data: rolesPermissions } =
        await this.workspacePermissionsCacheService.getRolesPermissionsFromCache(
          {
            workspaceId,
          },
        );

      return rolesPermissions[userRole.id] ?? {};
    }

    return null;
  }

  private async validateObjectMetadataAccess(
    objectMetadataId: string | null | undefined,
    userObjectPermissions: ObjectsPermissions | null,
  ): Promise<void> {
    if (!isDefined(objectMetadataId) || objectMetadataId === null) {
      return;
    }

    const hasPermission =
      userObjectPermissions?.[objectMetadataId]?.canReadObjectRecords === true;

    if (!hasPermission) {
      throw new PageLayoutWidgetException(
        generatePageLayoutWidgetExceptionMessage(
          PageLayoutWidgetExceptionMessageKey.OBJECT_METADATA_ACCESS_FORBIDDEN,
          objectMetadataId,
        ),
        PageLayoutWidgetExceptionCode.FORBIDDEN_OBJECT_METADATA_ACCESS,
      );
    }
  }

  private validateConfigurationUpdate(
    updateData: UpdatePageLayoutWidgetInput,
    existingObjectMetadataId: string | null,
    userObjectPermissions: ObjectsPermissions | null,
  ): void {
    if (
      isDefined(updateData.configuration) &&
      isDefined(existingObjectMetadataId)
    ) {
      const hasPermission =
        userObjectPermissions?.[existingObjectMetadataId]
          ?.canReadObjectRecords === true;

      if (!hasPermission) {
        throw new PageLayoutWidgetException(
          generatePageLayoutWidgetExceptionMessage(
            PageLayoutWidgetExceptionMessageKey.CONFIGURATION_UPDATE_FORBIDDEN,
          ),
          PageLayoutWidgetExceptionCode.FORBIDDEN_OBJECT_METADATA_ACCESS,
        );
      }
    }
  }

  private formatWidgetWithPermissions(
    widget: PageLayoutWidgetEntity,
    userObjectPermissions: ObjectsPermissions | null,
  ): PageLayoutWidgetDTO {
    const widgetWithPermission: PageLayoutWidgetDTO = {
      id: widget.id,
      pageLayoutTabId: widget.pageLayoutTabId,
      title: widget.title,
      type: widget.type,
      objectMetadataId: widget.objectMetadataId,
      gridPosition: widget.gridPosition,
      configuration: widget.configuration,
      createdAt: widget.createdAt,
      updatedAt: widget.updatedAt,
      deletedAt: widget.deletedAt,
      canReadWidget: false,
    };

    if (!userObjectPermissions) {
      widgetWithPermission.canReadWidget = !widget.objectMetadataId;
      widgetWithPermission.configuration = !widget.objectMetadataId
        ? widget.configuration
        : null;

      return widgetWithPermission;
    }

    return applyPermissionsToWidget(
      widgetWithPermission,
      userObjectPermissions,
    );
  }

  async findByPageLayoutTabIdWithPermissions(
    workspaceId: string,
    pageLayoutTabId: string,
    userWorkspaceId: string,
    apiKeyId?: string,
    transactionManager?: EntityManager,
  ): Promise<PageLayoutWidgetDTO[]> {
    const widgets = await this.findByPageLayoutTabId(
      workspaceId,
      pageLayoutTabId,
      transactionManager,
    );

    const userObjectPermissions = await this.getUserPermissions(
      workspaceId,
      userWorkspaceId,
      apiKeyId,
    );

    return widgets.map((widget) =>
      this.formatWidgetWithPermissions(widget, userObjectPermissions),
    );
  }

  async findByIdOrThrowWithPermissions(
    id: string,
    workspaceId: string,
    userWorkspaceId: string,
    apiKeyId?: string,
    transactionManager?: EntityManager,
  ): Promise<PageLayoutWidgetDTO> {
    const widget = await this.findByIdOrThrow(
      id,
      workspaceId,
      transactionManager,
    );

    const userObjectPermissions = await this.getUserPermissions(
      workspaceId,
      userWorkspaceId,
      apiKeyId,
    );

    return this.formatWidgetWithPermissions(widget, userObjectPermissions);
  }

  async createWithPermissions(
    pageLayoutWidgetData: CreatePageLayoutWidgetInput,
    workspaceId: string,
    userWorkspaceId: string,
    apiKeyId?: string,
    transactionManager?: EntityManager,
  ): Promise<PageLayoutWidgetDTO> {
    const userObjectPermissions = await this.getUserPermissions(
      workspaceId,
      userWorkspaceId,
      apiKeyId,
    );

    await this.validateObjectMetadataAccess(
      pageLayoutWidgetData.objectMetadataId,
      userObjectPermissions,
    );

    const widget = await this.create(
      pageLayoutWidgetData,
      workspaceId,
      transactionManager,
    );

    return this.formatWidgetWithPermissions(widget, userObjectPermissions);
  }

  async updateWithPermissions(
    id: string,
    workspaceId: string,
    updateData: UpdatePageLayoutWidgetInput,
    userWorkspaceId: string,
    apiKeyId?: string,
    transactionManager?: EntityManager,
  ): Promise<PageLayoutWidgetDTO> {
    const userObjectPermissions = await this.getUserPermissions(
      workspaceId,
      userWorkspaceId,
      apiKeyId,
    );

    const existingWidget = await this.findByIdOrThrow(
      id,
      workspaceId,
      transactionManager,
    );

    if (isDefined(updateData.objectMetadataId)) {
      await this.validateObjectMetadataAccess(
        updateData.objectMetadataId,
        userObjectPermissions,
      );
    }

    this.validateConfigurationUpdate(
      updateData,
      existingWidget.objectMetadataId,
      userObjectPermissions,
    );

    const widget = await this.update(
      id,
      workspaceId,
      updateData,
      transactionManager,
    );

    return this.formatWidgetWithPermissions(widget, userObjectPermissions);
  }

  async deleteWithPermissions(
    id: string,
    workspaceId: string,
    userWorkspaceId: string,
    apiKeyId?: string,
    transactionManager?: EntityManager,
  ): Promise<PageLayoutWidgetDTO> {
    const widget = await this.delete(id, workspaceId, transactionManager);

    const userObjectPermissions = await this.getUserPermissions(
      workspaceId,
      userWorkspaceId,
      apiKeyId,
    );

    return this.formatWidgetWithPermissions(widget, userObjectPermissions);
  }

  async restoreWithPermissions(
    id: string,
    workspaceId: string,
    userWorkspaceId: string,
    apiKeyId?: string,
    transactionManager?: EntityManager,
  ): Promise<PageLayoutWidgetDTO> {
    const widget = await this.restore(id, workspaceId, transactionManager);

    const userObjectPermissions = await this.getUserPermissions(
      workspaceId,
      userWorkspaceId,
      apiKeyId,
    );

    return this.formatWidgetWithPermissions(widget, userObjectPermissions);
  }
}
