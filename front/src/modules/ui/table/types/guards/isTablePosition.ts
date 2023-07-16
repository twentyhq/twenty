import { CellPosition } from '../CellPosition';

export function isTablePosition(value: any): value is CellPosition {
  return (
    value && typeof value.row === 'number' && typeof value.column === 'number'
  );
}
