import { SETTINGS_COMPOSITE_FIELD_TYPE_CONFIGS } from '@/settings/data-model/constants/SettingsCompositeFieldTypeConfigs';
import { useApolloClient } from '@apollo/client';
import saveAs from 'file-saver';
import { useCallback, useState } from 'react';
import { fetchObjectRecords } from '~/pages/settings/export/utils/fetchObjectRecords';
import { getBlob } from '~/pages/settings/export/utils/getBlob';
import type { ExportFormat } from '../types/exportFormat';
import type { ExportObjectItem } from '../types/exportObjectItem';
import type { ExportProgress } from '../types/exportProgress';

export const useMultipleObjectExport = () => {
  const apolloClient = useApolloClient();
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState<ExportProgress>({
    current: 0,
    total: 0,
    currentObject: '',
  });

  const exportObjects = useCallback(
    async (
      selectedItems: ExportObjectItem[],
      objectMetadataItems: any[],
      format: ExportFormat,
      preserveTypes = true,
    ) => {
      setIsExporting(true);
      setExportProgress({
        current: 0,
        total: selectedItems.length,
        currentObject: '',
      });

      for (let i = 0; i < selectedItems.length; i++) {
        const item = selectedItems[i];
        const objectMetadata = objectMetadataItems.find(
          (meta) => meta.id === item.id || meta.namePlural === item.name,
        );

        setExportProgress({
          current: i + 1,
          total: selectedItems.length,
          currentObject: item.labelPlural,
        });

        const rawRecords = await fetchObjectRecords(
          item.name,
          objectMetadata,
          apolloClient,
        );

        const fieldTypes = Array.isArray(objectMetadata?.fields)
          ? objectMetadata.fields.map((field: any) => ({
              name: field.name,
              type: field.type,
            }))
          : [];

        const compositeFields = fieldTypes
          .map(({ name, type }: { name: string; type: string }) => {
            const config =
              SETTINGS_COMPOSITE_FIELD_TYPE_CONFIGS[
                type as keyof typeof SETTINGS_COMPOSITE_FIELD_TYPE_CONFIGS
              ];
            return config ? { name, subFields: config.subFields } : null;
          })
          .filter(Boolean) as { name: string; subFields: string[] }[];

        try {
          const blob = await getBlob(
            format,
            rawRecords,
            compositeFields,
            preserveTypes,
            item,
            fieldTypes,
          );
          const timestamp = new Date().toISOString().split('T')[0];
          const filename = `${item.labelPlural}_${timestamp}.${format}`;
          saveAs(blob, filename);
        } catch (error) {
          console.error(`Failed to export ${item.labelPlural}:`, error);
        }
      }

      setIsExporting(false);
      setExportProgress({ current: 0, total: 0, currentObject: '' });
    },
    [apolloClient],
  );

  return { exportObjects, isExporting, exportProgress };
};
