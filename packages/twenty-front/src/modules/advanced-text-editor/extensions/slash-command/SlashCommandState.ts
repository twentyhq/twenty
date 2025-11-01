import { createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';

import { isDefined } from 'twenty-shared/utils';

import type { SlashCommandItem } from './SlashCommand';
import SlashCommandMenu from './SlashCommandMenu';

export class SlashCommandState {
  componentRoot: Root | null = null;
  containerElement: HTMLElement | null = null;
  selectedIndex: number = 0;
  currentItems: SlashCommandItem[] = [];
  currentCommand: (item: SlashCommandItem) => void = () => {};
  currentRect: DOMRect | null = null;
  scrollListener: (() => void) | null = null;
  clickOutsideListener: ((e: MouseEvent) => void) | null = null;
  dropdownElement: HTMLElement | null = null;
  private updateCallback: (() => void) | null = null;

  setUpdateCallback(callback: () => void): void {
    this.updateCallback = callback;
  }

  setSelectedIndex(index: number): void {
    this.selectedIndex = index;
    this.updateCallback?.();
  }

  setCurrentItems(items: SlashCommandItem[]): void {
    this.currentItems = items;
    this.updateCallback?.();
  }

  setCurrentCommand(command: (item: SlashCommandItem) => void): void {
    this.currentCommand = command;
  }

  setCurrentRect(rect: DOMRect | null): void {
    this.currentRect = rect;
    this.updateCallback?.();
  }

  cleanup(): void {
    if (this.componentRoot !== null) {
      this.componentRoot.unmount();
      this.componentRoot = null;
    }

    if (this.containerElement !== null) {
      this.containerElement.remove();
      this.containerElement = null;
    }

    if (this.scrollListener !== null) {
      window.removeEventListener('scroll', this.scrollListener, true);
      this.scrollListener = null;
    }

    if (this.clickOutsideListener !== null) {
      document.removeEventListener('mousedown', this.clickOutsideListener);
      this.clickOutsideListener = null;
    }

    this.selectedIndex = 0;
    this.currentRect = null;
    this.dropdownElement = null;
    this.currentItems = [];
    this.currentCommand = () => {};
  }
}

// Render the React component to the DOM
export const renderComponent = (state: SlashCommandState): void => {
  if (!state.containerElement) {
    state.containerElement = document.createElement('div');
    document.body.appendChild(state.containerElement);
  }

  // Create React root only once
  if (!state.componentRoot) {
    state.componentRoot = createRoot(state.containerElement);
  }

  state.componentRoot.render(
    createElement(SlashCommandMenu, {
      items: state.currentItems,
      selectedIndex: state.selectedIndex,
      onSelect: (item) => {
        state.currentCommand(item);
        state.cleanup();
      },
      clientRect: state.currentRect,
    }),
  );
};

export const findDropdownElement = (): HTMLElement | null => {
  return document.querySelector('[data-slash-command-menu]') as HTMLElement;
};

export const updateComponentRoot = (state: SlashCommandState): void => {
  renderComponent(state);
  state.dropdownElement = findDropdownElement();
};

export const createScrollListener = (
  state: SlashCommandState,
  getClientRect: () => DOMRect | null,
): (() => void) => {
  return () => {
    const updatedRect = getClientRect();
    if (isDefined(updatedRect) && state.componentRoot !== null) {
      state.setCurrentRect(updatedRect);
    }
  };
};

export const createClickOutsideListener = (
  state: SlashCommandState,
): ((e: MouseEvent) => void) => {
  return (e: MouseEvent) => {
    const target = e.target as Node;
    if (
      isDefined(state.dropdownElement) &&
      !state.dropdownElement.contains(target)
    ) {
      state.cleanup();
    }
  };
};

export const createKeyboardHandlers = (state: SlashCommandState) => ({
  handleEscape: (): boolean => {
    state.cleanup();
    return true;
  },

  handleArrowDown: (): boolean => {
    const newIndex = Math.min(
      state.selectedIndex + 1,
      (state.currentItems?.length || 1) - 1,
    );
    state.setSelectedIndex(newIndex);
    return true;
  },

  handleArrowUp: (): boolean => {
    const newIndex = Math.max(state.selectedIndex - 1, 0);
    state.setSelectedIndex(newIndex);
    return true;
  },

  handleEnter: (): boolean => {
    const item = state.currentItems[state.selectedIndex];
    if (item !== undefined) {
      state.currentCommand(item);
      state.cleanup();
      return true;
    }
    return false;
  },
});

export const handleKeyDown = (
  props: { event: KeyboardEvent },
  state: SlashCommandState,
): boolean => {
  const { event } = props;
  const handlers = createKeyboardHandlers(state);

  switch (event.key) {
    case 'Escape':
      return handlers.handleEscape();
    case 'ArrowDown':
      return handlers.handleArrowDown();
    case 'ArrowUp':
      return handlers.handleArrowUp();
    case 'Enter':
      return handlers.handleEnter();
    default:
      return false;
  }
};
