import { type Editor, type Range } from '@tiptap/core';

const mockUpdateProps = jest.fn();
const mockDestroy = jest.fn();
let mockElement: HTMLElement;

jest.mock('@tiptap/react', () => ({
  ReactRenderer: jest.fn().mockImplementation(() => {
    mockElement = document.createElement('div');
    return {
      element: mockElement,
      ref: null,
      updateProps: mockUpdateProps,
      destroy: mockDestroy,
    };
  }),
}));

import { createSuggestionRenderLifecycle } from '@/ui/suggestion/components/createSuggestionRenderLifecycle';

type TestItem = { id: string; label: string };
type TestMenuProps = {
  items: TestItem[];
  onSelect: (item: TestItem) => void;
  editor: Editor;
  range: Range;
};

const mockEditor = {} as Editor;

const createTestLifecycle = () =>
  createSuggestionRenderLifecycle<TestItem, TestMenuProps>(
    {
      component: (() => null) as unknown as React.ComponentType<TestMenuProps>,
      getMenuProps: ({ items, onSelect, editor, range }) => ({
        items,
        onSelect,
        editor,
        range,
      }),
    },
    mockEditor,
  );

const createMockCallbackProps = (
  overrides: Partial<{
    items: TestItem[];
    command: (item: TestItem) => void;
    clientRect: (() => DOMRect | null) | null;
    range: Range;
    query: string;
  }> = {},
) => ({
  items: [{ id: '1', label: 'Item A' }],
  command: jest.fn(),
  clientRect: () => new DOMRect(0, 0, 100, 20),
  range: { from: 0, to: 5 } as Range,
  query: '',
  ...overrides,
});

describe('createSuggestionRenderLifecycle', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('onStart', () => {
    it('should not create renderer when clientRect is missing', () => {
      const lifecycle = createTestLifecycle();

      lifecycle.onStart(createMockCallbackProps({ clientRect: undefined }));

      const { ReactRenderer } = jest.requireMock('@tiptap/react');
      expect(ReactRenderer).not.toHaveBeenCalled();
    });

    it('should not create renderer when items are empty', () => {
      const lifecycle = createTestLifecycle();

      lifecycle.onStart(createMockCallbackProps({ items: [] }));

      const { ReactRenderer } = jest.requireMock('@tiptap/react');
      expect(ReactRenderer).not.toHaveBeenCalled();
    });

    it('should create renderer and append element to body', () => {
      const lifecycle = createTestLifecycle();

      lifecycle.onStart(createMockCallbackProps());

      const { ReactRenderer } = jest.requireMock('@tiptap/react');
      expect(ReactRenderer).toHaveBeenCalledTimes(1);
      expect(document.body.contains(mockElement)).toBe(true);

      lifecycle.onExit();
    });
  });

  describe('onUpdate', () => {
    it('should close menu when items become empty', () => {
      const lifecycle = createTestLifecycle();
      lifecycle.onStart(createMockCallbackProps());

      lifecycle.onUpdate(createMockCallbackProps({ items: [] }));

      expect(mockDestroy).toHaveBeenCalled();
    });

    it('should update props on existing renderer', () => {
      const lifecycle = createTestLifecycle();
      lifecycle.onStart(createMockCallbackProps());

      const newItems = [{ id: '2', label: 'Item B' }];
      lifecycle.onUpdate(createMockCallbackProps({ items: newItems }));

      expect(mockUpdateProps).toHaveBeenCalled();

      lifecycle.onExit();
    });
  });

  describe('onKeyDown', () => {
    it('should close menu and return true on Escape', () => {
      const lifecycle = createTestLifecycle();
      lifecycle.onStart(createMockCallbackProps());

      const result = lifecycle.onKeyDown({
        event: new KeyboardEvent('keydown', { key: 'Escape' }),
      });

      expect(result).toBe(true);
      expect(mockDestroy).toHaveBeenCalled();
    });

    it('should return false when no renderer exists', () => {
      const lifecycle = createTestLifecycle();

      const result = lifecycle.onKeyDown({
        event: new KeyboardEvent('keydown', { key: 'ArrowDown' }),
      });

      expect(result).toBe(false);
    });
  });

  describe('onExit', () => {
    it('should clean up renderer', () => {
      const lifecycle = createTestLifecycle();
      lifecycle.onStart(createMockCallbackProps());

      lifecycle.onExit();

      expect(mockDestroy).toHaveBeenCalled();
    });

    it('should handle multiple onExit calls gracefully', () => {
      const lifecycle = createTestLifecycle();
      lifecycle.onStart(createMockCallbackProps());

      lifecycle.onExit();
      expect(() => lifecycle.onExit()).not.toThrow();
    });
  });

  describe('command wrapping', () => {
    it('should call original command and close menu on select', () => {
      const lifecycle = createTestLifecycle();
      const originalCommand = jest.fn();

      lifecycle.onStart(createMockCallbackProps({ command: originalCommand }));

      // Extract the onSelect callback from the props passed to ReactRenderer
      const { ReactRenderer } = jest.requireMock('@tiptap/react');
      const constructorCall = ReactRenderer.mock.calls[0];
      const menuProps = constructorCall[1].props;

      menuProps.onSelect({ id: '1', label: 'Item A' });

      expect(originalCommand).toHaveBeenCalledWith({
        id: '1',
        label: 'Item A',
      });
      expect(mockDestroy).toHaveBeenCalled();
    });
  });
});
