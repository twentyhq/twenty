import { ObjectOptionsDropdownCustomView } from '@/object-record/object-options-dropdown/components/ObjectOptionsDropdownCustomView';
import { ObjectOptionsDropdownDefaultView } from '@/object-record/object-options-dropdown/components/ObjectOptionsDropdownDefaultView';
import { useGetCurrentViewOnly } from '@/views/hooks/useGetCurrentViewOnly';
import { ViewKey } from '@/views/types/ViewKey';

export const ObjectOptionsDropdownMenuContent = () => {
  const { currentView } = useGetCurrentViewOnly();

  const isDefaultView = currentView?.key === ViewKey.Index;

  if (isDefaultView) {
    return <ObjectOptionsDropdownDefaultView />;
  }

  return <ObjectOptionsDropdownCustomView />;
};
