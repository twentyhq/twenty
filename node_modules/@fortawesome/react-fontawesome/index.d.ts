/// <reference types="react" />
import { CSSProperties, SVGAttributes, RefAttributes } from 'react'
import {
  Transform,
  IconProp,
  FlipProp,
  SizeProp,
  PullProp,
  RotateProp,
  FaSymbol
} from '@fortawesome/fontawesome-svg-core'

export function FontAwesomeIcon(props: FontAwesomeIconProps): JSX.Element

/**
 * @deprecated use FontAwesomeIconProps
 */
export type Props = FontAwesomeIconProps

// This is identical to the version of Omit in Typescript 3.5. It is included for compatibility with older versions of Typescript.
type BackwardCompatibleOmit<T, K extends keyof any> = Pick<T, Exclude<keyof T, K>>;

export interface FontAwesomeIconProps extends BackwardCompatibleOmit<SVGAttributes<SVGSVGElement>, 'children' | 'mask' | 'transform'>, RefAttributes<SVGSVGElement> {
  icon: IconProp
  mask?: IconProp
  maskId?: string
  className?: string
  color?: string
  spin?: boolean
  spinPulse?: boolean
  spinReverse?: boolean
  pulse?: boolean
  beat?: boolean
  fade?: boolean
  beatFade?: boolean
  bounce?: boolean
  shake?: boolean
  border?: boolean
  fixedWidth?: boolean
  inverse?: boolean
  listItem?: boolean
  flip?: FlipProp
  size?: SizeProp
  pull?: PullProp
  rotation?: RotateProp
  transform?: string | Transform
  symbol?: FaSymbol
  style?: CSSProperties
  tabIndex?: number;
  title?: string;
  titleId?: string;
  swapOpacity?: boolean;
}
