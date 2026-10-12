import { type InputMediaFeatures } from '@/types/InputMediaFeatures';

export type ViewportGeometrySnapshot = InputMediaFeatures & {
  innerWidth: number;
  innerHeight: number;
  devicePixelRatio: number;
  scrollX: number;
  scrollY: number;
  rootContainerX: number;
  rootContainerY: number;
  rootContainerWidth: number;
  rootContainerHeight: number;
  rootContainerClientWidth: number;
  rootContainerClientHeight: number;
};
