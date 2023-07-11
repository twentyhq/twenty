import { useRecoilState } from 'recoil';

import { commentableEntityArrayState } from '@/comments/states/commentableEntityArrayState';
import { RightDrawerBody } from '@/ui/layout/right-drawer/components/RightDrawerBody';
import { RightDrawerPage } from '@/ui/layout/right-drawer/components/RightDrawerPage';
import { RightDrawerTopBar } from '@/ui/layout/right-drawer/components/RightDrawerTopBar';

import { Timeline } from '../timeline/Timeline';

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
