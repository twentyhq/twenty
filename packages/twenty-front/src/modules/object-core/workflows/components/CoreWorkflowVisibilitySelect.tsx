import { t } from '@lingui/core/macro';

import { type WorkflowVisibility } from '~/generated/graphql';
import { CORE_WORKFLOW_VISIBILITY_OPTIONS } from '@/object-core/workflows/constants/CoreWorkflowVisibilityOptions';
import { useUpdateCoreWorkflowVisibility } from '@/object-core/workflows/hooks/useUpdateCoreWorkflowVisibility';
import { Select } from '@/ui/input/components/Select';

type CoreWorkflowVisibilitySelectProps = {
  coreWorkflowId: string;
  visibility: WorkflowVisibility;
  disabled?: boolean;
};

export const CoreWorkflowVisibilitySelect = ({
  coreWorkflowId,
  visibility,
  disabled = false,
}: CoreWorkflowVisibilitySelectProps) => {
  const { updateVisibility, isUpdatingVisibility } =
    useUpdateCoreWorkflowVisibility({ coreWorkflowId });

  return (
    <Select
      dropdownId={`core-workflow-visibility-${coreWorkflowId}`}
      aria-label={t`Visibility`}
      value={visibility}
      disabled={disabled || isUpdatingVisibility}
      showIconInControl
      options={CORE_WORKFLOW_VISIBILITY_OPTIONS.map((option) => ({
        value: option.value,
        label: t(option.label),
        Icon: option.Icon,
      }))}
      onChange={updateVisibility}
    />
  );
};
