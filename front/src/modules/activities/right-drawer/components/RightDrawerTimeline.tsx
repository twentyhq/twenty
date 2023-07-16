import { useRecoilState } from 'recoil';

import { commentableEntityArrayState } from '@/activities/states/commentableEntityArrayState';
import { Timeline } from '@/activities/timeline/components/Timeline';
import { RightDrawerBody } from '@/ui/right-drawer/components/RightDrawerBody';
import { RightDrawerPage } from '@/ui/right-drawer/components/RightDrawerPage';
import { RightDrawerTopBar } from '@/ui/right-drawer/components/RightDrawerTopBar';

export function RightDrawerTimeline() {
  const [commentableEntityArray] = useRecoilState(commentableEntityArrayState);

  return (
    <RightDrawerPage>
      <RightDrawerTopBar />
      <RightDrawerBody>
        {commentableEntityArray.map((commentableEntity) => (
          <Timeline
            key={commentableEntity.id}
            entity={{
              id: commentableEntity?.id ?? '',
              type: commentableEntity.type,
            }}
          />
        ))}
      </RightDrawerBody>
    </RightDrawerPage>
  );
}
