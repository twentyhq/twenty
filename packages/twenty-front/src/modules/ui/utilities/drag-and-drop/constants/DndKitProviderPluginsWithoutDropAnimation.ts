import { defaultPreset, Feedback } from '@dnd-kit/dom';

// Reorders commit on drop, so the default fly-back animation reads as a revert and paints over the side panel
export const DND_KIT_PROVIDER_PLUGINS_WITHOUT_DROP_ANIMATION =
  defaultPreset.plugins.map((plugin) =>
    plugin === Feedback ? Feedback.configure({ dropAnimation: null }) : plugin,
  );
