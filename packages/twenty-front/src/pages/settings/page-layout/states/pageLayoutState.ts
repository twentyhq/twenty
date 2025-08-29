import { type Layouts } from 'react-grid-layout';
import { atom } from 'recoil';
import { type Widget } from '../mocks/mockWidgets';

export const pageLayoutWidgetsState = atom<Widget[]>({
  key: 'pageLayoutWidgetsState',
  default: [],
});

export const pageLayoutLayoutsState = atom<Layouts>({
  key: 'pageLayoutLayoutsState',
  default: {
    lg: [],
    md: [],
    sm: [],
  },
});
