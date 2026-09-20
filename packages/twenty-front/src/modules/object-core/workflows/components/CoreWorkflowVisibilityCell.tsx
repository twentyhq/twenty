import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import { Tag } from 'twenty-ui/primitives/data-display';

import { type WorkflowVisibility } from '~/generated/graphql';
import { CORE_WORKFLOW_VISIBILITY_OPTIONS } from '@/object-core/workflows/constants/CoreWorkflowVisibilityOptions';

type CoreWorkflowVisibilityCellProps = {
  visibility: WorkflowVisibility;
};

export const CoreWorkflowVisibilityCell = ({
  visibility,
}: CoreWorkflowVisibilityCellProps) => {
  const visibilityOption = CORE_WORKFLOW_VISIBILITY_OPTIONS.find(
    ({ value }) => value === visibility,
  );

  if (!isDefined(visibilityOption)) {
    return null;
  }

  return (
    <Tag preventShrink color="gray" startIcon={<visibilityOption.Icon />}>
      {t(visibilityOption.label)}
    </Tag>
  );
};
