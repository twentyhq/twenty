import { useRecoilState } from 'recoil';

import { commentableEntityArrayState } from '@/activities/states/commentableEntityArrayState';
import { Timeline } from '@/activities/timeline/components/Timeline';

export function RightDrawerTimeline() {
  const [commentableEntityArray] = useRecoilState(commentableEntityArrayState);

  return (
    <>
      {commentableEntityArray.map((commentableEntity) => (
        <Timeline
          key={commentableEntity.id}
          entity={{
            id: commentableEntity?.id ?? '',
            type: commentableEntity.type,
          }}
        />
      ))}
    </>
  );
}
