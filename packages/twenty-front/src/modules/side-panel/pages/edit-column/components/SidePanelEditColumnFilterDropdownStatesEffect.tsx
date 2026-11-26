import { useSetAdvancedFilterDropdownStates } from '@/object-record/advanced-filter/hooks/useSetAdvancedFilterDropdownAllRowsStates';
import { useEffect } from 'react';

export const SidePanelEditColumnFilterDropdownStatesEffect = () => {
  const { setAdvancedFilterDropdownStates } =
    useSetAdvancedFilterDropdownStates();

  // Filter rows read their field and operand from dropdown states only this hook can fill
  useEffect(() => {
    setAdvancedFilterDropdownStates();
  }, [setAdvancedFilterDropdownStates]);

  return null;
};
