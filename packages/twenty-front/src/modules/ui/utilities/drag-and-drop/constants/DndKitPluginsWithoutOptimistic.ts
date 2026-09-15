import { SortableKeyboardPlugin } from '@dnd-kit/dom/sortable';

// Deliberately excludes dnd-kit's optimistic sorting plugin: application state
// stays the single source of truth for item order, so lists only reorder once
// a drop is committed.
export const DND_KIT_PLUGINS_WITHOUT_OPTIMISTIC = [SortableKeyboardPlugin];
