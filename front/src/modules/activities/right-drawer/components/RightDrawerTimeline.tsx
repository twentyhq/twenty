import { useRecoilValue } from 'recoil';

import { activityTargetableEntityArrayState } from '@/activities/states/activityTargetableEntityArrayState';
import { Timeline } from '@/activities/timeline/components/Timeline';

export function RightDrawerTimeline() {
  const activityTargetableEntityArray = useRecoilValue(
    activityTargetableEntityArrayState,
  );

  return (
    <>
      {activityTargetableEntityArray.map((targetableEntity) => (
        <Timeline
          key={targetableEntity.id}
          entity={{
            id: targetableEntity?.id ?? '',
            type: targetableEntity.type,
          }}
        />
      ))}
    </>
  );
}
