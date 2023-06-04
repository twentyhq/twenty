import { useRecoilState } from 'recoil';

import { RightDrawerComments } from '@/comments/components/comments/RightDrawerComments';
import { isDefined } from '@/utils/type-guards/isDefined';

import { rightDrawerPageState } from '../states/rightDrawerPageState';

export function RightDrawerRouter() {
  const [rightDrawerPage] = useRecoilState(rightDrawerPageState);

  if (!isDefined(rightDrawerPage)) {
    return <></>;
  }

  return rightDrawerPage === 'comments' ? <RightDrawerComments /> : <></>;
}
