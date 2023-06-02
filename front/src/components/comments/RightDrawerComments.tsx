import { useRecoilState } from 'recoil';
import { RightDrawerBody } from '../../layout/right-drawer/RightDrawerBody';
import { RightDrawerPage } from '../../layout/right-drawer/RightDrawerPage';
import { RightDrawerTopBar } from '../../layout/right-drawer/RightDrawerTopBar';
import { CommentTextInput } from './CommentTextInput';
import { commentableEntityArrayState } from '../../modules/comments/states/commentableEntityArrayState';

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
