import { Editor } from '@tiptap/core';
import { Document } from '@tiptap/extension-document';
import { Paragraph } from '@tiptap/extension-paragraph';
import { Text } from '@tiptap/extension-text';

import { type SlashCommandItem } from '@/advanced-text-editor/extensions/slash-command/SlashCommand';
import { SlashCommandRenderer } from '@/advanced-text-editor/extensions/slash-command/SlashCommandRenderer';

describe('SlashCommandRenderer', () => {
  let editor: Editor;
  let mockCommand: jest.Mock;
  let mockClientRect: () => DOMRect;

  const createMockItems = (): SlashCommandItem[] => [
    {
      id: 'test-1',
      title: 'Test Command 1',
      description: 'Test description',
      command: jest.fn(),
    },
    {
      id: 'test-2',
      title: 'Test Command 2',
      command: jest.fn(),
    },
  ];

  beforeEach(() => {
    editor = new Editor({
      extensions: [Document, Paragraph, Text],
      content: '<p></p>',
    });

    mockCommand = jest.fn();
    mockClientRect = () => new DOMRect(100, 100, 200, 50);
  });

  afterEach(() => {
    editor?.destroy();
  });

  describe('Lifecycle management', () => {
    it('should create container element and append to body', () => {
      const renderer = new SlashCommandRenderer({
        items: createMockItems(),
        command: mockCommand,
        clientRect: mockClientRect,
        editor,
        range: { from: 0, to: 0 },
        query: '',
      });

      expect(renderer.containerElement).toBeInstanceOf(HTMLElement);
      expect(document.body.contains(renderer.containerElement)).toBe(true);

      renderer.destroy();
    });

    it('should create React root on initialization', () => {
      const renderer = new SlashCommandRenderer({
        items: createMockItems(),
        command: mockCommand,
        clientRect: mockClientRect,
        editor,
        range: { from: 0, to: 0 },
        query: '',
      });

      expect(renderer.componentRoot).not.toBeNull();

      renderer.destroy();
    });

    it('should clean up on destroy', () => {
      const renderer = new SlashCommandRenderer({
        items: createMockItems(),
        command: mockCommand,
        clientRect: mockClientRect,
        editor,
        range: { from: 0, to: 0 },
        query: '',
      });

      const containerElement = renderer.containerElement;

      renderer.destroy();

      // After destroy, references should be null
      expect(renderer.componentRoot).toBeNull();
      expect(renderer.containerElement).toBeNull();
      expect(renderer.currentProps).toBeNull();
      expect(renderer.ref).toBeNull();

      // Container should be removed from DOM
      expect(document.body.contains(containerElement)).toBe(false);
    });

    it('should handle multiple destroy calls gracefully', () => {
      const renderer = new SlashCommandRenderer({
        items: createMockItems(),
        command: mockCommand,
        clientRect: mockClientRect,
        editor,
        range: { from: 0, to: 0 },
        query: '',
      });

      // First destroy
      renderer.destroy();

      // Second destroy should not throw
      expect(() => renderer.destroy()).not.toThrow();
    });
  });

  describe('Props updates', () => {
    it('should update items when updateProps is called', () => {
      const renderer = new SlashCommandRenderer({
        items: createMockItems(),
        command: mockCommand,
        clientRect: mockClientRect,
        editor,
        range: { from: 0, to: 0 },
        query: '',
      });

      const newItems: SlashCommandItem[] = [
        {
          id: 'new-item',
          title: 'New Item',
          command: jest.fn(),
        },
      ];

      renderer.updateProps({ items: newItems });

      expect(renderer.currentProps?.items).toEqual(newItems);

      renderer.destroy();
    });

    it('should update query when updateProps is called', () => {
      const renderer = new SlashCommandRenderer({
        items: createMockItems(),
        command: mockCommand,
        clientRect: mockClientRect,
        editor,
        range: { from: 0, to: 0 },
        query: '',
      });

      renderer.updateProps({ query: 'heading' });

      expect(renderer.currentProps?.query).toBe('heading');

      renderer.destroy();
    });

    it('should not update props if component is destroyed', () => {
      const renderer = new SlashCommandRenderer({
        items: createMockItems(),
        command: mockCommand,
        clientRect: mockClientRect,
        editor,
        range: { from: 0, to: 0 },
        query: '',
      });

      renderer.destroy();

      // After destroy, updateProps should not throw
      expect(() => renderer.updateProps({ query: 'test' })).not.toThrow();
    });

    it('should preserve unmodified props when updating', () => {
      const originalItems = createMockItems();
      const renderer = new SlashCommandRenderer({
        items: originalItems,
        command: mockCommand,
        clientRect: mockClientRect,
        editor,
        range: { from: 0, to: 0 },
        query: 'original',
      });

      // Update only query
      renderer.updateProps({ query: 'updated' });

      // Items should remain the same
      expect(renderer.currentProps?.items).toEqual(originalItems);
      // Query should be updated
      expect(renderer.currentProps?.query).toBe('updated');

      renderer.destroy();
    });
  });

  describe('Render method', () => {
    it('should not throw when render is called', () => {
      const renderer = new SlashCommandRenderer({
        items: createMockItems(),
        command: mockCommand,
        clientRect: mockClientRect,
        editor,
        range: { from: 0, to: 0 },
        query: '',
      });

      expect(() =>
        renderer.render({
          items: createMockItems(),
          command: mockCommand,
          clientRect: mockClientRect,
          editor,
          range: { from: 0, to: 0 },
          query: '',
        }),
      ).not.toThrow();

      renderer.destroy();
    });

    it('should not render if component root is null', () => {
      const renderer = new SlashCommandRenderer({
        items: createMockItems(),
        command: mockCommand,
        clientRect: mockClientRect,
        editor,
        range: { from: 0, to: 0 },
        query: '',
      });

      // Destroy to set componentRoot to null
      renderer.destroy();

      // Render should not throw even with null componentRoot
      expect(() =>
        renderer.render({
          items: createMockItems(),
          command: mockCommand,
          clientRect: mockClientRect,
          editor,
          range: { from: 0, to: 0 },
          query: '',
        }),
      ).not.toThrow();
    });
  });

  describe('Ref handling', () => {
    it('should initialize ref as null', () => {
      const renderer = new SlashCommandRenderer({
        items: createMockItems(),
        command: mockCommand,
        clientRect: mockClientRect,
        editor,
        range: { from: 0, to: 0 },
        query: '',
      });

      expect(renderer.ref).toBeNull();

      renderer.destroy();
    });

    it('should clear ref on destroy', () => {
      const renderer = new SlashCommandRenderer({
        items: createMockItems(),
        command: mockCommand,
        clientRect: mockClientRect,
        editor,
        range: { from: 0, to: 0 },
        query: '',
      });

      // Simulate ref being set
      renderer.ref = { onKeyDown: jest.fn() };

      renderer.destroy();

      expect(renderer.ref).toBeNull();
    });
  });

  describe('Memory management', () => {
    it('should not leak DOM elements after destroy', () => {
      const initialBodyChildCount = document.body.childElementCount;

      const renderer = new SlashCommandRenderer({
        items: createMockItems(),
        command: mockCommand,
        clientRect: mockClientRect,
        editor,
        range: { from: 0, to: 0 },
        query: '',
      });

      // Should have added one element
      expect(document.body.childElementCount).toBe(initialBodyChildCount + 1);

      renderer.destroy();

      // Should be back to initial count
      expect(document.body.childElementCount).toBe(initialBodyChildCount);
    });

    it('should handle rapid create/destroy cycles', () => {
      const initialBodyChildCount = document.body.childElementCount;

      // Create and destroy multiple renderers rapidly
      for (let i = 0; i < 10; i++) {
        const renderer = new SlashCommandRenderer({
          items: createMockItems(),
          command: mockCommand,
          clientRect: mockClientRect,
          editor,
          range: { from: 0, to: 0 },
          query: '',
        });
        renderer.destroy();
      }

      // Should be back to initial count
      expect(document.body.childElementCount).toBe(initialBodyChildCount);
    });
  });
});
