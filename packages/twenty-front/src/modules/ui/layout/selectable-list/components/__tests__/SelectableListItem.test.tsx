import { render, waitFor } from '@testing-library/react';
import { createStore, Provider as JotaiProvider } from 'jotai';

import { SelectableList } from '@/ui/layout/selectable-list/components/SelectableList';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { isSelectedItemIdComponentFamilyState } from '@/ui/layout/selectable-list/states/isSelectedItemIdComponentFamilyState';

const selectableListInstanceId = 'test-selectable-list';

const originalScrollIntoView = HTMLElement.prototype.scrollIntoView;

describe('SelectableListItem', () => {
  const scrollIntoViewMock = jest.fn();

  beforeEach(() => {
    scrollIntoViewMock.mockClear();

    Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
      configurable: true,
      value: scrollIntoViewMock,
    });
  });

  afterAll(() => {
    if (typeof originalScrollIntoView === 'function') {
      Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
        configurable: true,
        value: originalScrollIntoView,
      });

      return;
    }

    delete (
      HTMLElement.prototype as {
        scrollIntoView?: HTMLElement['scrollIntoView'];
      }
    ).scrollIntoView;
  });

  it('scrolls the selected item into view even when the scroll wrapper is at the top', async () => {
    const store = createStore();

    store.set(
      isSelectedItemIdComponentFamilyState.atomFamily({
        instanceId: selectableListInstanceId,
        familyKey: 'second-item',
      }),
      true,
    );

    render(
      <JotaiProvider store={store}>
        <div id="scroll-wrapper-test">
          <SelectableList
            selectableListInstanceId={selectableListInstanceId}
            selectableItemIdArray={['first-item', 'second-item']}
            focusId="test-focus-id"
          >
            <SelectableListItem itemId="first-item">
              First item
            </SelectableListItem>
            <SelectableListItem itemId="second-item">
              Second item
            </SelectableListItem>
          </SelectableList>
        </div>
      </JotaiProvider>,
    );

    await waitFor(() => {
      expect(scrollIntoViewMock).toHaveBeenCalledWith({
        behavior: 'auto',
        block: 'nearest',
      });
    });
  });
});
