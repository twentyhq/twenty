import { useRecoilState } from 'recoil';

import { tableCellOpenCauseFamilyState } from '../../states/tableCellOpenCauseFamilyState';

import { useCurrentTableCellPosition } from './useCurrentCellPosition';

export const useCurrentTableCellOpenCause = () => {
  const currentTableCellPosition = useCurrentTableCellPosition();

  const [currentTableCellOpenCause, setCurrentTableCellOpenCause] =
    useRecoilState(tableCellOpenCauseFamilyState(currentTableCellPosition));

  return {
    currentTableCellOpenCause,
    setCurrentTableCellOpenCause,
  };
};
