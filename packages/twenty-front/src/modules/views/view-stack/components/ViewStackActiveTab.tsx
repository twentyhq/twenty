import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { isDropdownOpenComponentState } from '@/ui/layout/dropdown/states/isDropdownOpenComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useGetRecordIndexTotalCount } from '@/views/hooks/internal/useGetRecordIndexTotalCount';
import { type View } from '@/views/types/View';
import { ViewPickerContentCreateMode } from '@/views/view-picker/components/ViewPickerContentCreateMode';
import { ViewPickerContentEditMode } from '@/views/view-picker/components/ViewPickerContentEditMode';
import { ViewPickerContentEffect } from '@/views/view-picker/components/ViewPickerContentEffect';
import { VIEW_PICKER_DROPDOWN_ID } from '@/views/view-picker/constants/ViewPickerDropdownId';
import { useUpdateViewFromCurrentState } from '@/views/view-picker/hooks/useUpdateViewFromCurrentState';
import { useViewPickerMode } from '@/views/view-picker/hooks/useViewPickerMode';
import { ViewStackTabButton } from '@/views/view-stack/components/ViewStackTabButton';
import { ViewStackTabDropdownContent } from '@/views/view-stack/components/ViewStackTabDropdownContent';
import { type ViewStack } from '@/views/view-stack/types/ViewStack';
import { isDefined } from 'twenty-shared/utils';

type ViewStackActiveTabProps = {
  viewStack: ViewStack;
  currentView: View | undefined;
  isLastView: boolean;
};

export const ViewStackActiveTab = ({
  viewStack,
  currentView,
  isLastView,
}: ViewStackActiveTabProps) => {
  const { totalCount } = useGetRecordIndexTotalCount();

  const isDropdownOpen = useAtomComponentStateValue(
    isDropdownOpenComponentState,
    VIEW_PICKER_DROPDOWN_ID,
  );

  const { viewPickerMode, setViewPickerMode } = useViewPickerMode();
  const { updateViewFromCurrentState } = useUpdateViewFromCurrentState();

  const handleClickOutside = async () => {
    if (isDropdownOpen && viewPickerMode === 'edit') {
      await updateViewFromCurrentState();
    }
    setViewPickerMode('list');
  };

  const activeChildView =
    isDefined(currentView) && currentView.id !== viewStack.rootView.id
      ? currentView
      : undefined;

  return (
    <Dropdown
      dropdownId={VIEW_PICKER_DROPDOWN_ID}
      dropdownOffset={{ x: 0, y: 8 }}
      dropdownPlacement="bottom-start"
      onClickOutside={handleClickOutside}
      clickableComponent={
        <ViewStackTabButton
          rootView={viewStack.rootView}
          isActive
          isDropdownOpen={isDropdownOpen}
          activeChildView={activeChildView}
          totalCount={totalCount}
        />
      }
      dropdownComponents={(() => {
        switch (viewPickerMode) {
          case 'list':
            return (
              <ViewStackTabDropdownContent
                viewStack={viewStack}
                currentViewId={currentView?.id}
                isLastView={isLastView}
              />
            );
          case 'create-empty':
          case 'create-from-current':
            return (
              <>
                <ViewPickerContentCreateMode />
                <ViewPickerContentEffect />
              </>
            );
          case 'edit':
            return (
              <>
                <ViewPickerContentEditMode />
                <ViewPickerContentEffect />
              </>
            );
          default:
            return null;
        }
      })()}
    />
  );
};
