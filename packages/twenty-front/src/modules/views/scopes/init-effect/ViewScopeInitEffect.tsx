import { useEffect } from 'react';
import { useSetRecoilState } from 'recoil';

import { useViewStates } from '@/views/hooks/internal/useViewStates';
import { GraphQLView } from '@/views/types/GraphQLView';

type ViewScopeInitEffectProps = {
  viewScopeId: string;
  onCurrentViewChange: (view: GraphQLView | undefined) => void | Promise<void>;
};

export const ViewScopeInitEffect = ({
  onCurrentViewChange,
}: ViewScopeInitEffectProps) => {
  const { onCurrentViewChangeState } = useViewStates();

  const setOnCurrentViewChange = useSetRecoilState(onCurrentViewChangeState);

  useEffect(() => {
    setOnCurrentViewChange(() => onCurrentViewChange);
  }, [onCurrentViewChange, setOnCurrentViewChange]);

  return <></>;
};
