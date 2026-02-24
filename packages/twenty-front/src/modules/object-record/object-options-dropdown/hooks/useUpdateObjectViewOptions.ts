import { recordIndexOpenRecordInState } from '@/object-record/record-index/states/recordIndexOpenRecordInState';
import { recordIndexOpenRecordInStateV2 } from '@/object-record/record-index/states/recordIndexOpenRecordInStateV2';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/jotai/hooks/useSetRecoilComponentStateV2';
import { useSetRecoilStateV2 } from '@/ui/utilities/state/jotai/hooks/useSetRecoilStateV2';
import { useStore } from 'jotai';
import { useUpdateCurrentView } from '@/views/hooks/useUpdateCurrentView';
import { type GraphQLView } from '@/views/types/GraphQLView';
import { type ViewOpenRecordInType } from '@/views/types/ViewOpenRecordInType';
import { viewPickerInputNameComponentState } from '@/views/view-picker/states/viewPickerInputNameComponentState';
import { viewPickerSelectedIconComponentState } from '@/views/view-picker/states/viewPickerSelectedIconComponentState';
import { useCallback } from 'react';

export const useUpdateObjectViewOptions = () => {
  const store = useStore();

  const setRecordIndexOpenRecordIn = useSetRecoilStateV2(
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
      store.set(recordIndexOpenRecordInStateV2.atom, openRecordIn);
      updateCurrentView({
        openRecordIn,
      });
    },
    [setRecordIndexOpenRecordIn, updateCurrentView, store],
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
