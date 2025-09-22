import type { ObjectsPermissions } from 'twenty-shared/types';

import type { PageLayoutWidgetDTO } from 'src/engine/core-modules/page-layout/dtos/page-layout-widget.dto';
import type { PageLayoutWidgetEntity } from 'src/engine/core-modules/page-layout/entities/page-layout-widget.entity';

export const transformWidgetEntityToDTO = (
  widget: PageLayoutWidgetEntity,
  objectPermissions: ObjectsPermissions,
): PageLayoutWidgetDTO => {
  if (!widget.objectMetadataId) {
    return {
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
      canReadWidget: true,
    };
  }

  const hasPermission =
    objectPermissions?.[widget.objectMetadataId]?.canReadObjectRecords === true;

  return {
    id: widget.id,
    pageLayoutTabId: widget.pageLayoutTabId,
    title: widget.title,
    type: widget.type,
    objectMetadataId: widget.objectMetadataId,
    gridPosition: widget.gridPosition,
    configuration: hasPermission ? widget.configuration : null,
    createdAt: widget.createdAt,
    updatedAt: widget.updatedAt,
    deletedAt: widget.deletedAt,
    canReadWidget: hasPermission,
  };
};
