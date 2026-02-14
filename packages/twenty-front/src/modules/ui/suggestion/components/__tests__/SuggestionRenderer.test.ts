import { forwardRef } from 'react';

import { SuggestionRenderer } from '@/ui/suggestion/components/SuggestionRenderer';

type TestItem = { id: string; label: string };
type TestMenuProps = { items: TestItem[]; onSelect: (item: TestItem) => void };
type TestRendererProps = {
  items: TestItem[];
  command: (item: TestItem) => void;
};

const MockMenu = forwardRef<unknown, TestMenuProps>(() => null);

const testConfig = {
  component: MockMenu,
  mapProps: (props: TestRendererProps): TestMenuProps => ({
    items: props.items,
    onSelect: props.command,
  }),
};

const createMockItems = (): TestItem[] => [
  { id: '1', label: 'Item A' },
  { id: '2', label: 'Item B' },
];

describe('SuggestionRenderer', () => {
  describe('lifecycle', () => {
    it('should create container element and append to body', () => {
      const renderer = new SuggestionRenderer(testConfig, {
        items: createMockItems(),
        command: jest.fn(),
      });

      expect(renderer.containerElement).toBeInstanceOf(HTMLElement);
      expect(document.body.contains(renderer.containerElement)).toBe(true);

      renderer.destroy();
    });

    it('should create React root on initialization', () => {
      const renderer = new SuggestionRenderer(testConfig, {
        items: createMockItems(),
        command: jest.fn(),
      });

      expect(renderer.componentRoot).not.toBeNull();
      renderer.destroy();
    });

    it('should clean up all references on destroy', () => {
      const renderer = new SuggestionRenderer(testConfig, {
        items: createMockItems(),
        command: jest.fn(),
      });

      const containerElement = renderer.containerElement;

      renderer.destroy();

      expect(renderer.componentRoot).toBeNull();
      expect(renderer.containerElement).toBeNull();
      expect(renderer.currentProps).toBeNull();
      expect(renderer.ref).toBeNull();
      expect(document.body.contains(containerElement)).toBe(false);
    });

    it('should handle multiple destroy calls gracefully', () => {
      const renderer = new SuggestionRenderer(testConfig, {
        items: createMockItems(),
        command: jest.fn(),
      });

      renderer.destroy();
      expect(() => renderer.destroy()).not.toThrow();
    });
  });

  describe('props updates', () => {
    it('should update items when updateProps is called', () => {
      const renderer = new SuggestionRenderer(testConfig, {
        items: createMockItems(),
        command: jest.fn(),
      });

      const newItems: TestItem[] = [{ id: 'new', label: 'New' }];
      renderer.updateProps({ items: newItems });

      expect(renderer.currentProps?.items).toEqual(newItems);
      renderer.destroy();
    });

    it('should preserve unmodified props when updating', () => {
      const originalItems = createMockItems();
      const renderer = new SuggestionRenderer(testConfig, {
        items: originalItems,
        command: jest.fn(),
      });

      renderer.updateProps({ command: jest.fn() });

      expect(renderer.currentProps?.items).toEqual(originalItems);
      renderer.destroy();
    });

    it('should not throw when updating after destroy', () => {
      const renderer = new SuggestionRenderer(testConfig, {
        items: createMockItems(),
        command: jest.fn(),
      });

      renderer.destroy();

      expect(() =>
        renderer.updateProps({ items: createMockItems() }),
      ).not.toThrow();
    });
  });

  describe('memory management', () => {
    it('should not leak DOM elements after destroy', () => {
      const initialChildCount = document.body.childElementCount;

      const renderer = new SuggestionRenderer(testConfig, {
        items: createMockItems(),
        command: jest.fn(),
      });

      expect(document.body.childElementCount).toBe(initialChildCount + 1);

      renderer.destroy();

      expect(document.body.childElementCount).toBe(initialChildCount);
    });

    it('should handle rapid create/destroy cycles', () => {
      const initialChildCount = document.body.childElementCount;

      for (let i = 0; i < 10; i++) {
        const renderer = new SuggestionRenderer(testConfig, {
          items: createMockItems(),
          command: jest.fn(),
        });
        renderer.destroy();
      }

      expect(document.body.childElementCount).toBe(initialChildCount);
    });
  });

  describe('ref handling', () => {
    it('should initialize ref as null', () => {
      const renderer = new SuggestionRenderer(testConfig, {
        items: createMockItems(),
        command: jest.fn(),
      });

      expect(renderer.ref).toBeNull();
      renderer.destroy();
    });

    it('should clear ref on destroy', () => {
      const renderer = new SuggestionRenderer(testConfig, {
        items: createMockItems(),
        command: jest.fn(),
      });

      renderer.ref = { onKeyDown: jest.fn() };
      renderer.destroy();

      expect(renderer.ref).toBeNull();
    });
  });
});
