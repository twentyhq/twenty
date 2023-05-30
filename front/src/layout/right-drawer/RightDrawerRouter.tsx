import { useRecoilState } from 'recoil';
import { rightDrawerPageState } from '../../modules/ui/layout/right-drawer/states/rightDrawerPageState';
import { isDefined } from '../../modules/utils/type-guards/isDefined';
import { RightDrawerComments } from '../../components/comments/RightDrawerComments';

export function RightDrawerRouter() {
  const [rightDrawerPage] = useRecoilState(rightDrawerPageState);

  if (!isDefined(rightDrawerPage)) {
    return <></>;
  }

  return rightDrawerPage === 'comments' ? <RightDrawerComments /> : <></>;
}
