import { EntityForSelect } from '@/object-record/relation-picker/types/EntityForSelect';
import { createComponentFamilyState } from '@/ui/utilities/state/component-state/utils/createComponentFamilyState';

export type NewCard = {
  id: string;
  columnId: string;
  isCreating: boolean;
  position: 'first' | 'last';
  isOpportunity: boolean;
  company: EntityForSelect | null;
};

export const recordBoardNewRecordByColumnIdComponentFamilyState =
  createComponentFamilyState<NewCard, string>({
    key: 'recordBoardNewRecordByColumnIdComponentFamilyState',
    defaultValue: {
      id: '',
      columnId: '',
      isCreating: false,
      position: 'last',
      isOpportunity: false,
      company: null,
    },
  });
