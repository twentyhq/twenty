import { TablePosition } from '../TablePosition';

export function isTablePosition(value: any): value is TablePosition {
  return (
    value && typeof value.row === 'number' && typeof value.column === 'number'
  );
}
