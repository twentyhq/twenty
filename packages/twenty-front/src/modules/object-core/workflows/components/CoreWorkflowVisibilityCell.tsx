import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

import { type WorkflowVisibility } from '~/generated/graphql';
import { CORE_WORKFLOW_VISIBILITY_OPTIONS } from '@/object-core/workflows/constants/CoreWorkflowVisibilityOptions';
import { SelectDisplay } from '@/ui/field/display/components/SelectDisplay/SelectDisplay';

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
    <SelectDisplay
      color="transparent"
      label={t(visibilityOption.label)}
      Icon={visibilityOption.Icon}
      preventPadding
    />
  );
};
