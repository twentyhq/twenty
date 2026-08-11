import { Select } from '@/ui/input/components/Select';
import { useAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { ViewPickerSelectContainer } from '@/views/view-picker/components/ViewPickerSelectContainer';
import { VIEW_PICKER_STACK_DROPDOWN_ID } from '@/views/view-picker/constants/ViewPickerStackDropdownId';
import { viewPickerIsDirtyComponentState } from '@/views/view-picker/states/viewPickerIsDirtyComponentState';
import { viewPickerParentViewIdComponentState } from '@/views/view-picker/states/viewPickerParentViewIdComponentState';
import { viewPickerReferenceViewIdComponentState } from '@/views/view-picker/states/viewPickerReferenceViewIdComponentState';
import { useAreViewStacksEnabled } from '@/views/view-stack/hooks/useAreViewStacksEnabled';
import { useViewStacks } from '@/views/view-stack/hooks/useViewStacks';
import { useLingui } from '@lingui/react/macro';

type ViewPickerStackSelectProps = {
  isEditingExistingView?: boolean;
};

export const ViewPickerStackSelect = ({
  isEditingExistingView = false,
}: ViewPickerStackSelectProps) => {
  const { t } = useLingui();

  const { areViewStacksEnabled } = useAreViewStacksEnabled();
  const { viewStacks } = useViewStacks();

  const [viewPickerParentViewId, setViewPickerParentViewId] =
    useAtomComponentState(viewPickerParentViewIdComponentState);

  const setViewPickerIsDirty = useSetAtomComponentState(
    viewPickerIsDirtyComponentState,
  );

  const viewPickerReferenceViewId = useAtomComponentStateValue(
    viewPickerReferenceViewIdComponentState,
  );

  if (!areViewStacksEnabled) {
    return null;
  }

  const editedViewStack = isEditingExistingView
    ? viewStacks.find(
        (viewStack) => viewStack.rootView.id === viewPickerReferenceViewId,
      )
    : undefined;

  // A view that already holds a stack cannot be moved inside another one.
  if ((editedViewStack?.childViews.length ?? 0) > 0) {
    return null;
  }

  const options = [
    { value: '', label: t`No stack` },
    ...viewStacks
      .filter(
        (viewStack) =>
          !isEditingExistingView ||
          viewStack.rootView.id !== viewPickerReferenceViewId,
      )
      .map((viewStack) => ({
        value: viewStack.rootView.id,
        label: viewStack.rootView.name,
      })),
  ];

  return (
    <ViewPickerSelectContainer>
      <Select
        label={t`Stack`}
        fullWidth
        value={viewPickerParentViewId}
        onChange={(value) => {
          setViewPickerIsDirty(true);
          setViewPickerParentViewId(value);
        }}
        options={options}
        dropdownId={VIEW_PICKER_STACK_DROPDOWN_ID}
      />
    </ViewPickerSelectContainer>
  );
};
