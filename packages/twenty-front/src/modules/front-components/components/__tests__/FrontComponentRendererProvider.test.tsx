import { fireEvent, render } from '@testing-library/react';

import { FrontComponentRendererProvider } from '@/front-components/components/FrontComponentRendererProvider';

const mockPushFocusItemToFocusStack = jest.fn();
const mockRemoveFocusItemFromFocusStackById = jest.fn();

jest.mock('@/ui/utilities/focus/hooks/usePushFocusItemToFocusStack', () => ({
  usePushFocusItemToFocusStack: () => ({
    pushFocusItemToFocusStack: mockPushFocusItemToFocusStack,
  }),
}));

jest.mock('@/ui/utilities/focus/hooks/useRemoveFocusItemFromFocusStackById', () => ({
  useRemoveFocusItemFromFocusStackById: () => ({
    removeFocusItemFromFocusStackById: mockRemoveFocusItemFromFocusStackById,
  }),
}));

describe('FrontComponentRendererProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should disable conflicting global hotkeys when focusing an editable input', () => {
    const { getByRole } = render(
      <FrontComponentRendererProvider frontComponentId="front-component-id">
        <input />
      </FrontComponentRendererProvider>,
    );

    fireEvent.focus(getByRole('textbox'));

    expect(mockPushFocusItemToFocusStack).toHaveBeenCalledWith({
      focusId: 'front-component-renderer-front-component-id-input',
      component: {
        type: 'text-input',
        instanceId: 'front-component-renderer-front-component-id-input',
      },
      globalHotkeysConfig: {
        enableGlobalHotkeysConflictingWithKeyboard: false,
      },
    });
  });

  it('should keep focus stack item while moving focus between editable fields', () => {
    const { getByTestId } = render(
      <FrontComponentRendererProvider frontComponentId="front-component-id">
        <>
          <input data-testid="first-input" />
          <textarea data-testid="second-input" />
        </>
      </FrontComponentRendererProvider>,
    );

    const firstInput = getByTestId('first-input');
    const secondInput = getByTestId('second-input');

    fireEvent.focus(firstInput);
    fireEvent.blur(firstInput, { relatedTarget: secondInput });

    expect(mockRemoveFocusItemFromFocusStackById).not.toHaveBeenCalledWith({
      focusId: 'front-component-renderer-front-component-id-input',
    });
  });

  it('should restore global hotkeys when editable input loses focus', () => {
    const { getByRole } = render(
      <FrontComponentRendererProvider frontComponentId="front-component-id">
        <>
          <input />
          <button type="button">Action</button>
        </>
      </FrontComponentRendererProvider>,
    );

    const input = getByRole('textbox');
    const button = getByRole('button', { name: 'Action' });

    fireEvent.focus(input);
    fireEvent.blur(input, { relatedTarget: button });

    expect(mockRemoveFocusItemFromFocusStackById).toHaveBeenCalledWith({
      focusId: 'front-component-renderer-front-component-id-input',
    });
  });
});
