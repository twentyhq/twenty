import { type NewRecordTitleCellToOpen } from '@/object-record/record-title-cell/types/NewRecordTitleCellToOpen';
import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const newRecordTitleCellToOpenState =
  createAtomState<NewRecordTitleCellToOpen | null>({
    key: 'record-title-cell/newRecordTitleCellToOpenState',
    defaultValue: null,
  });
