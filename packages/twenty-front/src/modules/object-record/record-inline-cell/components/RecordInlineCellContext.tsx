import { HotkeyScope } from '@/ui/utilities/hotkey/types/HotkeyScope';
import { createContext, ReactElement, useContext } from 'react';
import { IconComponent } from 'twenty-ui';

export type RecordInlineCellContextProps = {
  readonly?: boolean;
  IconLabel?: IconComponent;
  label?: string;
  labelWidth?: number;
  showLabel?: boolean;
  buttonIcon?: IconComponent;
  editModeContent?: ReactElement;
  editModeContentOnly?: boolean;
  displayModeContent: ReactElement;
  customEditHotkeyScope?: HotkeyScope;
  isDisplayModeFixHeight?: boolean;
  disableHoverEffect?: boolean;
  loading?: boolean;
  isCentered?: boolean;
};

export const RecordInlineCellContext = createContext<RecordInlineCellContextProps | undefined>(undefined);

export const useRecordInlineCellContext = (): RecordInlineCellContextProps => {
  const context = useContext(RecordInlineCellContext);
  if (!context) {
    throw new Error('RecordInlineCellContextProps is not defined properly inside the custom hook useRecordInlineCellContext');
  }
  return context;
};
