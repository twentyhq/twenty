export type DuplicateDirection = 'before' | 'after';

export type TabActions = {
  onRename?: (tabId: string, newTitle: string) => void;
  onDuplicate?: (tabId: string, insertAt: DuplicateDirection) => void;
  onDelete?: (tabId: string) => void;
};
