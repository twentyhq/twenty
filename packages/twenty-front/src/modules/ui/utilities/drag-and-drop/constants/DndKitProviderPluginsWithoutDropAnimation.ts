import { defaultPreset, Feedback } from '@dnd-kit/dom';

// Twenty applies reorders to application state the moment a drop commits, so
// dnd-kit's default drop animation, which flies the dragged element back to
// its pre-drag position, reads as the drop being reverted. The animating
// element is also position: fixed with an infinite z-index, so it paints over
// overlays such as the record side panel while it flies back.
export const DND_KIT_PROVIDER_PLUGINS_WITHOUT_DROP_ANIMATION =
  defaultPreset.plugins.map((plugin) =>
    plugin === Feedback ? Feedback.configure({ dropAnimation: null }) : plugin,
  );
