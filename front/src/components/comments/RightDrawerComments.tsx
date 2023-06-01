import { RightDrawerBody } from '../../layout/right-drawer/RightDrawerBody';
import { RightDrawerPage } from '../../layout/right-drawer/RightDrawerPage';
import { RightDrawerTopBar } from '../../layout/right-drawer/RightDrawerTopBar';
import { CommentTextInput } from './CommentTextInput';

export function RightDrawerComments() {
  function handleSendComment(text: string) {
    console.log(text);
  }

  return (
    <RightDrawerPage>
      <RightDrawerTopBar title="Comments" />
      <RightDrawerBody>
        <CommentTextInput onSend={handleSendComment} />
      </RightDrawerBody>
    </RightDrawerPage>
  );
}
