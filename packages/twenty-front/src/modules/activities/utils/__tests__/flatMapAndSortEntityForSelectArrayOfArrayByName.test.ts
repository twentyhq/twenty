import { EntityForSelect } from '@/object-record/relation-picker/types/EntityForSelect';

import { flatMapAndSortEntityForSelectArrayOfArrayByName } from '../flatMapAndSortEntityForSelectArrayByName';

describe('flatMapAndSortEntityForSelectArrayOfArrayByName', () => {
  it('should return the correct value', () => {
    const entityForSelectArray = [
      [
        { id: 1, name: 'xRya' },
        { id: 2, name: 'BrcA' },
      ],
      [
        { id: 3, name: 'aCxd' },
        { id: 4, name: 'kp7u' },
      ],
    ] as unknown as EntityForSelect[][];

    const res =
      flatMapAndSortEntityForSelectArrayOfArrayByName(entityForSelectArray);

    expect(res).toHaveLength(4);
    expect(res[0].id).toBe(3);
    expect(res[1].id).toBe(2);
    expect(res[2].id).toBe(4);
    expect(res[3].id).toBe(1);
  });
});
