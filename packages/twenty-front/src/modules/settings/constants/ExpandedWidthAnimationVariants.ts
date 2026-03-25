import { ADVANCED_SETTINGS_ANIMATION_DURATION } from '@/settings/constants/AdvancedSettingsAnimationDurations';

export const EXPANDED_WIDTH_ANIMATION_VARIANTS = {
  initial: {
    opacity: 0,
    width: 0,
    overflow: 'hidden',
    transition: {
      opacity: { duration: ADVANCED_SETTINGS_ANIMATION_DURATION.opacity },
      width: { duration: ADVANCED_SETTINGS_ANIMATION_DURATION.size },
    },
  },
  animate: {
    opacity: 1,
    width: '100%',
    overflow: 'hidden',
    transition: {
      opacity: { duration: ADVANCED_SETTINGS_ANIMATION_DURATION.opacity },
      width: { duration: ADVANCED_SETTINGS_ANIMATION_DURATION.size },
    },
  },
  exit: {
    opacity: 0,
    width: 0,
    overflow: 'hidden',
    transition: {
      opacity: { duration: ADVANCED_SETTINGS_ANIMATION_DURATION.opacity },
      width: { duration: ADVANCED_SETTINGS_ANIMATION_DURATION.size },
    },
  },
};
