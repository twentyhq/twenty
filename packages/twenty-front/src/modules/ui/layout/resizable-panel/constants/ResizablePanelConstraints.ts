import { type ResizablePanelConstraints } from '../types/ResizablePanelTypes';

export const NAVIGATION_DRAWER_CONSTRAINTS: ResizablePanelConstraints = {
  min: 180,
  max: 350,
  default: 220,
  collapseThreshold: 150,
};

export const COMMAND_MENU_CONSTRAINTS: ResizablePanelConstraints = {
  min: 320,
  max: 600,
  default: 400,
  collapseThreshold: 250,
};

export const RESIZE_DRAG_THRESHOLD_PX = 5;
export const RESIZE_EDGE_WIDTH_PX = 8;

export const NAVIGATION_DRAWER_COLLAPSED_WIDTH = 40;

