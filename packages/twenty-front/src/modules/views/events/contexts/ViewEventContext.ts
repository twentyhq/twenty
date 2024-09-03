import { createEventContext } from '@/ui/utilities/state/instance/utils/createEventContext';
import { View } from '@/views/types/View';

type ViewEventContextType = {
  onCurrentViewChange: (view: View | undefined) => void | Promise<void>;
};

export const ViewEventContext = createEventContext<ViewEventContextType>();
