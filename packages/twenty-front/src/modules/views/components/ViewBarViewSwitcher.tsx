import { ViewPickerDropdown } from '@/views/view-picker/components/ViewPickerDropdown';
import { useAreViewStacksEnabled } from '@/views/view-stack/hooks/useAreViewStacksEnabled';
import { ViewStackTabList } from '@/views/view-stack/components/ViewStackTabList';

export const ViewBarViewSwitcher = () => {
  const { areViewStacksEnabled } = useAreViewStacksEnabled();

  if (areViewStacksEnabled) {
    return <ViewStackTabList />;
  }

  return <ViewPickerDropdown />;
};
