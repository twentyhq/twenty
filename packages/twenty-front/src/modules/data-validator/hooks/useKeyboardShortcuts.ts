import { useEffect } from 'react';

type ShortcutHandlers = {
  onApprove: () => void;
  onReject: () => void;
  onSkip: () => void;
  onSupport: () => void;
  onEdit: () => void;
  onUndo: () => void;
  onHelp: () => void;
};

export const useKeyboardShortcuts = (
  handlers: ShortcutHandlers,
  enabled: boolean,
) => {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      const tagName = target.tagName.toLowerCase();

      // Don't trigger shortcuts when typing in inputs
      if (
        tagName === 'input' ||
        tagName === 'textarea' ||
        tagName === 'select' ||
        target.isContentEditable
      ) {
        return;
      }

      switch (event.key) {
        case 'ArrowRight':
          event.preventDefault();
          handlers.onApprove();
          break;
        case 'ArrowLeft':
          event.preventDefault();
          handlers.onReject();
          break;
        case 'ArrowDown':
          event.preventDefault();
          handlers.onSkip();
          break;
        case 's':
        case 'S':
          if (!event.ctrlKey && !event.metaKey) {
            event.preventDefault();
            handlers.onSupport();
          }
          break;
        case 'e':
        case 'E':
          event.preventDefault();
          handlers.onEdit();
          break;
        case 'z':
        case 'Z':
          if (event.ctrlKey || event.metaKey || !event.shiftKey) {
            event.preventDefault();
            handlers.onUndo();
          }
          break;
        case '?':
          event.preventDefault();
          handlers.onHelp();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlers, enabled]);
};
