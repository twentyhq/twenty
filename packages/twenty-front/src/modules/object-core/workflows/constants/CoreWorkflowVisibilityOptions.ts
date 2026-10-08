import { msg } from '@lingui/core/macro';

import { type CoreWorkflowVisibilityOption } from '@/object-core/workflows/types/CoreWorkflowVisibilityOption';
import { WorkflowVisibility } from '~/generated/graphql';

export const CORE_WORKFLOW_VISIBILITY_OPTIONS: CoreWorkflowVisibilityOption[] =
  [
    {
      value: WorkflowVisibility.WORKSPACE,
      label: msg`Workspace`,
      contextualText: msg`Everyone`,
    },
    {
      value: WorkflowVisibility.PRIVATE,
      label: msg`Private`,
      contextualText: msg`Only you`,
    },
  ];
