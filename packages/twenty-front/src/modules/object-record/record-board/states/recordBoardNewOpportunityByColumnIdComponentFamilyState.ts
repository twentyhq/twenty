import { EntityForSelect } from '@/object-record/relation-picker/types/EntityForSelect';
import { createComponentFamilyState } from '@/ui/utilities/state/component-state/utils/createComponentFamilyState';

export type NewOpportunity = {
  id: string;
  columnId: string;
  isCreating: boolean;
  position: 'first' | 'last';
  company: EntityForSelect | null;
};

export const recordBoardNewOpportunityByColumnIdComponentFamilyState =
  createComponentFamilyState<NewOpportunity, string>({
    key: 'recordBoardNewOpportunityByColumnIdComponentFamilyState',
    defaultValue: {
      id: '',
      columnId: '',
      isCreating: false,
      position: 'last',
      company: null,
    },
  });
