import { Editor } from '@tiptap/core';
import { Document } from '@tiptap/extension-document';
import { Paragraph } from '@tiptap/extension-paragraph';
import { Text } from '@tiptap/extension-text';

import { MentionSuggestionRenderer } from '@/mention/extensions/MentionSuggestionRenderer';
import type { MentionSearchResult } from '@/mention/types/MentionSearchResult';

// Mock the React component to avoid theme/context dependencies
jest.mock('@/mention/components/MentionSuggestionMenu', () => ({
  MentionSuggestionMenu: jest.fn(),
}));

describe('MentionSuggestionRenderer', () => {
  let editor: Editor;
  let mockCommand: jest.Mock;
  let mockClientRect: () => DOMRect;

  const createMockItems = (): MentionSearchResult[] => [
    {
      recordId: 'r1',
      objectNameSingular: 'company',
      objectLabelSingular: 'Company',
      label: 'Acme Corp',
      imageUrl: '',
    },
    {
      recordId: 'r2',
      objectNameSingular: 'person',
      objectLabelSingular: 'Person',
      label: 'Alice Smith',
      imageUrl: 'https://example.com/alice.png',
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

  describe('lifecycle', () => {
    it('should create container element and append to body', () => {
      const renderer = new MentionSuggestionRenderer({
        items: createMockItems(),
        command: mockCommand,
        clientRect: mockClientRect,
        editor,
        range: { from: 0, to: 0 },
      });

      expect(renderer.containerElement).toBeInstanceOf(HTMLElement);
      expect(document.body.contains(renderer.containerElement)).toBe(true);

      renderer.destroy();
    });

    it('should create React root on initialization', () => {
      const renderer = new MentionSuggestionRenderer({
        items: createMockItems(),
        command: mockCommand,
        clientRect: mockClientRect,
        editor,
        range: { from: 0, to: 0 },
      });

      expect(renderer.componentRoot).not.toBeNull();

      renderer.destroy();
    });

    it('should clean up all references on destroy', () => {
      const renderer = new MentionSuggestionRenderer({
        items: createMockItems(),
        command: mockCommand,
        clientRect: mockClientRect,
        editor,
        range: { from: 0, to: 0 },
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
      const renderer = new MentionSuggestionRenderer({
        items: createMockItems(),
        command: mockCommand,
        clientRect: mockClientRect,
        editor,
        range: { from: 0, to: 0 },
      });

      renderer.destroy();

      expect(() => renderer.destroy()).not.toThrow();
    });
  });

  describe('props updates', () => {
    it('should update items when updateProps is called', () => {
      const renderer = new MentionSuggestionRenderer({
        items: createMockItems(),
        command: mockCommand,
        clientRect: mockClientRect,
        editor,
        range: { from: 0, to: 0 },
      });

      const newItems: MentionSearchResult[] = [
        {
          recordId: 'new-1',
          objectNameSingular: 'task',
          objectLabelSingular: 'Task',
          label: 'New Task',
          imageUrl: '',
        },
      ];

      renderer.updateProps({ items: newItems });

      expect(renderer.currentProps?.items).toEqual(newItems);

      renderer.destroy();
    });

    it('should preserve unmodified props when updating', () => {
      const originalItems = createMockItems();
      const renderer = new MentionSuggestionRenderer({
        items: originalItems,
        command: mockCommand,
        clientRect: mockClientRect,
        editor,
        range: { from: 0, to: 0 },
      });

      renderer.updateProps({ command: jest.fn() });

      expect(renderer.currentProps?.items).toEqual(originalItems);

      renderer.destroy();
    });

    it('should not throw when updating after destroy', () => {
      const renderer = new MentionSuggestionRenderer({
        items: createMockItems(),
        command: mockCommand,
        clientRect: mockClientRect,
        editor,
        range: { from: 0, to: 0 },
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

      const renderer = new MentionSuggestionRenderer({
        items: createMockItems(),
        command: mockCommand,
        clientRect: mockClientRect,
        editor,
        range: { from: 0, to: 0 },
      });

      expect(document.body.childElementCount).toBe(initialChildCount + 1);

      renderer.destroy();

      expect(document.body.childElementCount).toBe(initialChildCount);
    });

    it('should handle rapid create/destroy cycles', () => {
      const initialChildCount = document.body.childElementCount;

      for (let i = 0; i < 10; i++) {
        const renderer = new MentionSuggestionRenderer({
          items: createMockItems(),
          command: mockCommand,
          clientRect: mockClientRect,
          editor,
          range: { from: 0, to: 0 },
        });
        renderer.destroy();
      }

      expect(document.body.childElementCount).toBe(initialChildCount);
    });
  });

  describe('ref handling', () => {
    it('should initialize ref as null', () => {
      const renderer = new MentionSuggestionRenderer({
        items: createMockItems(),
        command: mockCommand,
        clientRect: mockClientRect,
        editor,
        range: { from: 0, to: 0 },
      });

      expect(renderer.ref).toBeNull();

      renderer.destroy();
    });

    it('should clear ref on destroy', () => {
      const renderer = new MentionSuggestionRenderer({
        items: createMockItems(),
        command: mockCommand,
        clientRect: mockClientRect,
        editor,
        range: { from: 0, to: 0 },
      });

      renderer.ref = { onKeyDown: jest.fn() };

      renderer.destroy();

      expect(renderer.ref).toBeNull();
    });
  });
});
