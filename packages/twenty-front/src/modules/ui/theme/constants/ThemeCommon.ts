/* eslint-disable @nx/workspace-no-hardcoded-colors */
import { ANIMATION } from '@/ui/theme/constants/Animation';
import { BLUR } from '@/ui/theme/constants/Blur';
import { COLOR } from '@/ui/theme/constants/Colors';
import { GRAY_SCALE } from '@/ui/theme/constants/GrayScale';
import { ICON } from '@/ui/theme/constants/Icon';
import { MODAL } from '@/ui/theme/constants/Modal';
import { TEXT } from '@/ui/theme/constants/Text';

export const THEME_COMMON = {
  color: COLOR,
  grayScale: GRAY_SCALE,
  icon: ICON,
  modal: MODAL,
  text: TEXT,
  blur: BLUR,
  animation: ANIMATION,
  snackBar: {
    success: {
      background: '#16A26B',
      color: '#D0F8E9',
    },
    error: {
      background: '#B43232',
      color: '#FED8D8',
    },
    info: {
      background: COLOR.gray80,
      color: GRAY_SCALE.gray0,
    },
  },
  spacingMultiplicator: 4,
  spacing: (...args: number[]) =>
    args.map((multiplicator) => `${multiplicator * 4}px`).join(' '),
  betweenSiblingsGap: `2px`,
  table: {
    horizontalCellMargin: '8px',
    checkboxColumnWidth: '32px',
    horizontalCellPadding: '8px',
  },
  rightDrawerWidth: '500px',
  clickableElementBackgroundTransition: 'background 0.1s ease',
  lastLayerZIndex: 2147483647,
};
