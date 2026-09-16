import { ColoredIcon } from '@/ui/icon/components/ColoredIcon';
import { type IconComponent } from 'twenty-ui/icon';
import { NavigationMenuItemIconWithOverlay } from '@/navigation-menu-item/display/components/NavigationMenuItemIconWithOverlay';

export type ObjectIconWithViewOverlayProps = {
  ObjectIcon: IconComponent;
  ViewIcon: IconComponent;
  objectColor?: string | null;
};

export const ObjectIconWithViewOverlay = ({
  ObjectIcon,
  ViewIcon,
  objectColor,
}: ObjectIconWithViewOverlayProps) => (
  <NavigationMenuItemIconWithOverlay OverlayIcon={ViewIcon}>
    <ColoredIcon Icon={ObjectIcon} color={objectColor} />
  </NavigationMenuItemIconWithOverlay>
);
