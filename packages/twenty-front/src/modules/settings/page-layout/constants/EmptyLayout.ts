import { type Layouts } from 'react-grid-layout';

export const EMPTY_LAYOUT: Layouts = {
  desktop: [{ i: 'empty-placeholder', x: 0, y: 0, w: 4, h: 4, static: true }],
  mobile: [{ i: 'empty-placeholder', x: 0, y: 0, w: 1, h: 4, static: true }],
};
