import { recordIndexOpenRecordInState } from '@/object-record/record-index/states/recordIndexOpenRecordInState';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentStateV2';
import { useUpdateCurrentView } from '@/views/hooks/useUpdateCurrentView';
import { GraphQLView } from '@/views/types/GraphQLView';
import { ViewOpenRecordInType } from '@/views/types/ViewOpenRecordInType';
import { viewPickerInputNameComponentState } from '@/views/view-picker/states/viewPickerInputNameComponentState';
import { viewPickerSelectedIconComponentState } from '@/views/view-picker/states/viewPickerSelectedIconComponentState';
import { useCallback } from 'react';
import { useSetRecoilState } from 'recoil';

export const useUpdateObjectViewOptions = () => {
  const setRecordIndexOpenRecordIn = useSetRecoilState(
    recordIndexOpenRecordInState,
  );

  const setRecordIndexViewName = useSetRecoilComponentStateV2(
    viewPickerInputNameComponentState,
  );

  const setRecordIndexViewIcon = useSetRecoilComponentStateV2(
    viewPickerSelectedIconComponentState,
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

  const setAndPersistViewName = useCallback(
    (viewName: string, view: GraphQLView | undefined) => {
      if (!view) return;
      setRecordIndexViewName(viewName);
      updateCurrentView({
        name: viewName,
      });
    },
    [setRecordIndexViewName, updateCurrentView],
  );

  const setAndPersistViewIcon = useCallback(
    (viewIcon: string, view: GraphQLView | undefined) => {
      if (!view) return;
      setRecordIndexViewIcon(viewIcon);
      updateCurrentView({
        icon: viewIcon,
      });
    },
    [setRecordIndexViewIcon, updateCurrentView],
  );

  return {
    setAndPersistOpenRecordIn,
    setAndPersistViewName,
    setAndPersistViewIcon,
  };
};
