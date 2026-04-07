import { usePerformViewAPIPersist } from '@/views/hooks/internal/usePerformViewAPIPersist';
import { useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { ViewType } from '~/generated-metadata/graphql';

export const useCreateViewForFieldsWidget = () => {
  const { performViewAPICreate } = usePerformViewAPIPersist();

  const createViewForFieldsWidget = useCallback(
    async ({
      objectMetadataId,
      viewName,
    }: {
      objectMetadataId: string;
      viewName: string;
    }) => {
      const viewId = uuidv4();

      const result = await performViewAPICreate(
        {
          input: {
            id: viewId,
            name: viewName,
            icon: 'IconList',
            objectMetadataId,
            type: ViewType.FIELDS_WIDGET,
          },
        },
        objectMetadataId,
      );

      if (result.status === 'failed') {
        return null;
      }

      return viewId;
    },
    [performViewAPICreate],
  );

  return { createViewForFieldsWidget };
};
