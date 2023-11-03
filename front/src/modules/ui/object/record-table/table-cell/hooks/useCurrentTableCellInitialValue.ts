import { useRecoilState } from 'recoil';

import { tableCellInitialValueFamilyState } from '../../states/tableCellInitialValueFamilyState';

import { useCurrentTableCellPosition } from './useCurrentCellPosition';

export const useCurrentTableCellInitialValue = () => {
  const currentTableCellPosition = useCurrentTableCellPosition();

  const [currentTableCellInitialValue, setCurrentTableCellInitialValue] =
    useRecoilState(tableCellInitialValueFamilyState(currentTableCellPosition));

  return {
    currentTableCellInitialValue,
    setCurrentTableCellInitialValue,
  };
};
