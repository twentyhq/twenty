import {
  type MountedCommandState,
  type MountedHeadlessFrontComponentCommandState,
} from '@/command-menu-item/engine-command/types/MountedCommandState';

export const isMountedFrontComponentCommandState = (
  state: MountedCommandState,
): state is MountedHeadlessFrontComponentCommandState =>
  'frontComponentId' in state;
