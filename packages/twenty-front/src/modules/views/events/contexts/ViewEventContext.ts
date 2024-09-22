import { View } from '@/views/types/View';
import { createEventContext } from '~/utils/createEventContext';

type ViewEventContextType = {
  onCurrentViewChange: (view: View | undefined) => void | Promise<void>;
};

export const ViewEventContext = createEventContext<ViewEventContextType>();
