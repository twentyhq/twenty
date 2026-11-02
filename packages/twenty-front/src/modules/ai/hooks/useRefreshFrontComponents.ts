import { useLingui } from '@lingui/react/macro';
import { useToast } from 'twenty-ui/components/feedback';

import { useLoadStaleMetadataEntities } from '@/metadata-store/hooks/useLoadStaleMetadataEntities';

export const useRefreshFrontComponents = () => {
  const { t } = useLingui();
  const { enqueueToast } = useToast();
  const { loadStaleMetadataEntities } = useLoadStaleMetadataEntities();

  const refreshFrontComponents = async () => {
    try {
      await loadStaleMetadataEntities(['frontComponents']);
    } catch {
      enqueueToast({
        children: t`Could not refresh components. Reload to see saved changes.`,
        status: 'error',
      });
    }
  };

  return { refreshFrontComponents };
};
