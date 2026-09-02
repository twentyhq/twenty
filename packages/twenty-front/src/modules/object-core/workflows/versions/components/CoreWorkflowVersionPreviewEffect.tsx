import { useEffect } from 'react';

import { previewedWorkflowVersionFamilyState } from '@/object-core/workflows/versions/states/previewedWorkflowVersionFamilyState';
import { useSetAtomFamilyState } from '@/ui/utilities/state/jotai/hooks/useSetAtomFamilyState';

export const CoreWorkflowVersionPreviewEffect = ({
  workflowId,
}: {
  workflowId: string;
}) => {
  const setPreviewedWorkflowVersion = useSetAtomFamilyState(
    previewedWorkflowVersionFamilyState,
    { workflowId },
  );

  useEffect(() => {
    setPreviewedWorkflowVersion(null);

    return () => {
      setPreviewedWorkflowVersion(null);
    };
  }, [setPreviewedWorkflowVersion]);

  return null;
};
