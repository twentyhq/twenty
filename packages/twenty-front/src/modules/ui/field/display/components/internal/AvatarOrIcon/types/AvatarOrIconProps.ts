import { type IconComponent } from 'twenty-ui/icon';
import {
  type AvatarProps,
  type AvatarShape,
} from 'twenty-ui/primitives/data-display';
import { type Nullable } from 'twenty-ui/utilities';

export type AvatarOrIconProps = Pick<
  AvatarProps,
  'src' | 'name' | 'colorSeed'
> & {
  shape?: Nullable<AvatarShape>;
  Icon?: IconComponent;
  IconColor?: string;
  IconBackgroundColor?: string;
  isIconInverted?: boolean;
  onClick?: () => void;
};
