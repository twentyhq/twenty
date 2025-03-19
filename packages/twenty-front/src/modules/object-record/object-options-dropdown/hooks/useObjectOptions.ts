import { recordIndexOpenRecordInState } from '@/object-record/record-index/states/recordIndexOpenRecordInState';
import { useUpdateCurrentView } from '@/views/hooks/useUpdateCurrentView';
import { GraphQLView } from '@/views/types/GraphQLView';
import { ViewOpenRecordInType } from '@/views/types/ViewOpenRecordInType';
import { useCallback } from 'react';
import { useSetRecoilState } from 'recoil';

export const useObjectOptions = () => {
  const setRecordIndexOpenRecordIn = useSetRecoilState(
    recordIndexOpenRecordInState,
  );

  const { updateCurrentView } = useUpdateCurrentView();

  const setAndPersistOpenRecordIn = useCallback(
    (openRecordIn: ViewOpenRecordInType, view: GraphQLView | undefined) => {
      if (!view) return;
      setRecordIndexOpenRecordIn(openRecordIn);
      updateCurrentView({
        openRecordIn,
      });
    },
    [setRecordIndexOpenRecordIn, updateCurrentView],
  );

  return {
    setAndPersistOpenRecordIn,
  };
};
