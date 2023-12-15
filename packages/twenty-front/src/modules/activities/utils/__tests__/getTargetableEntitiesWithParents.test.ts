import { ActivityTargetableEntity } from '@/activities/types/ActivityTargetableEntity';
import { getTargetableEntitiesWithParents } from '@/activities/utils/getTargetableEntitiesWithParents';

describe('getTargetableEntitiesWithParents', () => {
  it('should return the correct value', () => {
    const entities: ActivityTargetableEntity[] = [
      {
        id: '1',
        type: 'Person',
        relatedEntities: [
          {
            id: '2',
            type: 'Company',
          },
        ],
      },
      {
        id: '4',
        type: 'Company',
      },
      {
        id: '3',
        type: 'Custom',
        relatedEntities: [
          {
            id: '6',
            type: 'Person',
          },
          {
            id: '5',
            type: 'Company',
          },
        ],
      },
    ];

    const res = getTargetableEntitiesWithParents(entities);

    expect(res).toHaveLength(6);
    expect(res[0].id).toBe('1');
    expect(res[1].id).toBe('2');
    expect(res[2].id).toBe('4');
    expect(res[3].id).toBe('3');
    expect(res[4].id).toBe('6');
    expect(res[5].id).toBe('5');
  });
});
