import { SortableKeyboardPlugin } from '@dnd-kit/dom/sortable';

// No optimistic sorting: application state owns item order, so lists reorder only once a drop commits
export const DND_KIT_PLUGINS_WITHOUT_OPTIMISTIC = [SortableKeyboardPlugin];
