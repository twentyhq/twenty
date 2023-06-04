import { useRecoilState } from 'recoil';

import { RightDrawerBody } from '@/ui/layout/right-drawer/components/RightDrawerBody';
import { RightDrawerPage } from '@/ui/layout/right-drawer/components/RightDrawerPage';
import { RightDrawerTopBar } from '@/ui/layout/right-drawer/components/RightDrawerTopBar';

import { commentableEntityArrayState } from '../../states/commentableEntityArrayState';

import { CommentTextInput } from './CommentTextInput';

export function RightDrawerComments() {
  const [commentableEntityArray] = useRecoilState(commentableEntityArrayState);

  function handleSendComment(text: string) {
    console.log(text);
  }

  return (
    <RightDrawerPage>
      <RightDrawerTopBar title="Comments" />
      <RightDrawerBody>
        {commentableEntityArray.map((commentableEntity) => (
          <div key={commentableEntity.id}>
            {commentableEntity.type} - {commentableEntity.id}
          </div>
        ))}
        <CommentTextInput onSend={handleSendComment} />
      </RightDrawerBody>
    </RightDrawerPage>
  );
}
