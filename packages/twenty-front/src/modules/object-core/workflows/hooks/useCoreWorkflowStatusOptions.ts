import { useLingui } from '@lingui/react/macro';
import { type SelectOption } from 'twenty-ui/primitives/input';

import { CORE_WORKFLOW_STATUS_FILTER_OPTIONS } from '@/object-core/workflows/constants/CoreWorkflowStatusFilterOptions';

export const useCoreWorkflowStatusOptions = (): SelectOption[] => {
  const { t } = useLingui();

  return CORE_WORKFLOW_STATUS_FILTER_OPTIONS.map(({ value, label, color }) => {
    return { value, label: t(label), color };
  });
};
