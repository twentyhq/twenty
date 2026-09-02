import { useEffect } from 'react';

import { previewedCoreWorkflowVersionFamilyState } from '@/object-core/workflows/versions/states/previewedCoreWorkflowVersionFamilyState';
import { useSetAtomFamilyState } from '@/ui/utilities/state/jotai/hooks/useSetAtomFamilyState';

export const CoreWorkflowVersionPreviewEffect = ({
  workflowId,
}: {
  workflowId: string;
}) => {
  const setPreviewedCoreWorkflowVersion = useSetAtomFamilyState(
    previewedCoreWorkflowVersionFamilyState,
    { workflowId },
  );

  useEffect(() => {
    setPreviewedCoreWorkflowVersion(null);

    return () => {
      setPreviewedCoreWorkflowVersion(null);
    };
  }, [setPreviewedCoreWorkflowVersion]);

  return null;
};
