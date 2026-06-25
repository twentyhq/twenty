import {
  type HeadlessCommandContextApi,
  type HeadlessFrontComponentCommandContextApi,
} from '@/command-menu-item/engine-command/types/HeadlessCommandContextApi';

export const isHeadlessFrontComponentCommandContextApi = (
  state: HeadlessCommandContextApi,
): state is HeadlessFrontComponentCommandContextApi =>
  'frontComponentId' in state;
