import { ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { flattenTargetableObjectsAndTheirRelatedTargetableObjects } from '@/activities/utils/flattenTargetableObjectsAndTheirRelatedTargetableObjects';

describe('getTargetableEntitiesWithParents', () => {
  it('should return the correct value', () => {
    const entities: ActivityTargetableObject[] = [
      {
        id: '1',
        targetObjectNameSingular: 'person',
        relatedTargetableObjects: [
          {
            id: '2',
            targetObjectNameSingular: 'company',
          },
        ],
      },
      {
        id: '4',
        targetObjectNameSingular: 'person',
      },
      {
        id: '3',
        targetObjectNameSingular: 'car',
        relatedTargetableObjects: [
          {
            id: '6',
            targetObjectNameSingular: 'person',
          },
          {
            id: '5',
            targetObjectNameSingular: 'company',
          },
        ],
      },
    ];

    const res =
      flattenTargetableObjectsAndTheirRelatedTargetableObjects(entities);

    expect(res).toHaveLength(6);
    expect(res[0].id).toBe('1');
    expect(res[1].id).toBe('2');
    expect(res[2].id).toBe('4');
    expect(res[3].id).toBe('3');
    expect(res[4].id).toBe('6');
    expect(res[5].id).toBe('5');
  });
});
