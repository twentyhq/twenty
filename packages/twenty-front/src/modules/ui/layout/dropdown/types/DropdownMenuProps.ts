import { type MenuPopupProps } from 'twenty-ui/primitives/surfaces';
import { type Placement } from '@floating-ui/react';
import { type ReactElement, type ReactNode } from 'react';
import { type DropdownOffset } from '@/ui/layout/dropdown/types/DropdownOffset';
import { type GlobalHotkeysConfig } from '@/ui/utilities/hotkey/types/GlobalHotkeysConfig';

export type DropdownMenuProps = {
  dropdownId: string;
  clickableComponent?: ReactElement;
  dropdownComponents: ReactNode;
  dropdownPlacement?: Placement;
  dropdownOffset?: DropdownOffset;
  positionReference?: HTMLElement | null;
  globalHotkeysConfig?: Partial<GlobalHotkeysConfig>;
  finalFocus?: MenuPopupProps['finalFocus'];
  onOpen?: () => void;
  onClose?: () => void;
  nativeButton?: boolean;
  openOnClick?: boolean;
};
