import { createComponentFamilyState } from '@/ui/utilities/state/component-state/utils/createComponentFamilyState';

export const recordBoardRecordIdsByColumnIdComponentFamilyState =
  createComponentFamilyState<string[], string>({
    key: 'recordBoardRecordIdsByColumnIdComponentFamilyState',
    defaultValue: [],
  });
