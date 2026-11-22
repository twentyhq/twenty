import { msg } from '@lingui/core/macro';

import { type CoreWorkflowVisibilityOption } from '@/object-core/workflows/types/CoreWorkflowVisibilityOption';

export const CORE_WORKFLOW_VISIBILITY_OPTIONS: CoreWorkflowVisibilityOption[] =
  [
    {
      isPrivate: false,
      label: msg`Workspace`,
      contextualText: msg`Everyone`,
    },
    {
      isPrivate: true,
      label: msg`Private`,
      contextualText: msg`Only you`,
    },
  ];
