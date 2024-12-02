import { RecordForSelect } from '@/object-record/relation-picker/types/RecordForSelect';
import { createComponentFamilyState } from '@/ui/utilities/state/component-state/utils/createComponentFamilyState';

export type NewCard = {
  id: string;
  columnId: string;
  isCreating: boolean;
  position: 'first' | 'last';
  isOpportunity: boolean;
  company: RecordForSelect | null;
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
