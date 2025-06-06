import { getObjectTypeLabel } from '@/settings/data-model/utils/getObjectTypeLabel';
import { ExportObjectItem } from '~/pages/settings/export/types/exportObjectItem';

export const createExportItems = (
  objectMetadataItems: any[],
  totalCountByObjectMetadataItemNamePlural: Record<string, number>,
): ExportObjectItem[] =>
  objectMetadataItems.map((objectMetadataItem) => {
    const objectTypeLabel = getObjectTypeLabel(objectMetadataItem);
    return {
      id: objectMetadataItem.id,
      name: objectMetadataItem.namePlural,
      labelPlural: objectMetadataItem.labelPlural,
      objectTypeLabel: objectTypeLabel,
      objectTypeLabelText: objectTypeLabel.labelText,
      fieldsCount: objectMetadataItem.fields?.filter(
        (field: any) => !field.isSystem,
      ).length,
      totalObjectCount:
        totalCountByObjectMetadataItemNamePlural[
          objectMetadataItem.namePlural
        ] ?? 0,
      icon: objectMetadataItem.icon,
    };
  });
