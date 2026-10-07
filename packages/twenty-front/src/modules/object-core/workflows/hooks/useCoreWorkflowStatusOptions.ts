import { useLingui } from '@lingui/react/macro';
import { type SelectOption } from 'twenty-ui/primitives/input';

export const useCoreWorkflowStatusOptions = (): SelectOption[] => {
  const { t } = useLingui();

  return [
    { value: 'DRAFT', label: t`Draft`, color: 'yellow' },
    { value: 'ACTIVE', label: t`Active`, color: 'green' },
    { value: 'DEACTIVATED', label: t`Deactivated`, color: 'gray' },
  ];
};
