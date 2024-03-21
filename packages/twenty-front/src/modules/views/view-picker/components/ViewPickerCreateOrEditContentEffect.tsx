import { useEffect } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';

import { useGetCurrentView } from '@/views/hooks/useGetCurrentView';
import { useViewPickerStates } from '@/views/view-picker/hooks/useViewPickerStates';
import { isDefined } from '~/utils/isDefined';

export const ViewPickerCreateOrEditContentEffect = () => {
  const {
    viewPickerSelectedIconState,
    viewPickerInputNameState,
    viewPickerReferenceViewIdState,
    viewPickerIsPersistingState,
  } = useViewPickerStates();

  const setViewPickerSelectedIcon = useSetRecoilState(
    viewPickerSelectedIconState,
  );
  const setViewPickerInputName = useSetRecoilState(viewPickerInputNameState);

  const viewPickerReferenceViewId = useRecoilValue(
    viewPickerReferenceViewIdState,
  );

  const viewPickerIsPersisting = useRecoilValue(viewPickerIsPersistingState);

  const { viewsOnCurrentObject } = useGetCurrentView();
  const editedView = viewsOnCurrentObject.find(
    (view) => view.id === viewPickerReferenceViewId,
  );

  useEffect(() => {
    if (isDefined(editedView) && !viewPickerIsPersisting) {
      setViewPickerSelectedIcon(editedView.icon);
      setViewPickerInputName(editedView.name);
    }
  }, [
    editedView,
    setViewPickerInputName,
    setViewPickerSelectedIcon,
    viewPickerIsPersisting,
  ]);

  return <></>;
};
