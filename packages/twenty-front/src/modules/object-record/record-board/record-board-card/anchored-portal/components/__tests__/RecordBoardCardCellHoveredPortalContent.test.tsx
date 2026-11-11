import { RecordBoardCardCellHoveredPortalContent } from '@/object-record/record-board/record-board-card/anchored-portal/components/RecordBoardCardCellHoveredPortalContent';
import { RecordBoardCardComponentInstanceContext } from '@/object-record/record-board/record-board-card/states/contexts/RecordBoardCardComponentInstanceContext';
import { RecordBoardComponentInstanceContext } from '@/object-record/record-board/states/contexts/RecordBoardComponentInstanceContext';
import {
  FieldContext,
  type GenericFieldContextType,
} from '@/object-record/record-field/ui/contexts/FieldContext';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider as JotaiProvider, createStore } from 'jotai';
import { createPortal } from 'react-dom';
import { IconCopy } from 'twenty-ui/icon';

const mockOpenRecordBoardCard = jest.fn();
const mockOpenInlineCell = jest.fn();
const mockOpenFieldInput = jest.fn();
const mockCopy = jest.fn();

jest.mock(
  '@/object-record/record-board/record-board-card/hooks/useOpenRecordBoardCard',
  () => ({
    useOpenRecordBoardCard: () => ({
      openRecordBoardCard: mockOpenRecordBoardCard,
    }),
  }),
);

jest.mock('@/object-record/record-inline-cell/hooks/useInlineCell', () => ({
  useInlineCell: () => ({ openInlineCell: mockOpenInlineCell }),
}));

jest.mock(
  '@/object-record/record-field/ui/hooks/useOpenFieldInputEditMode',
  () => ({
    useOpenFieldInputEditMode: () => ({ openFieldInput: mockOpenFieldInput }),
  }),
);

jest.mock(
  '@/object-record/record-field/ui/hooks/useGetSecondaryFieldButton',
  () => ({
    useGetSecondaryFieldButton: () => [
      { Icon: IconCopy, onClick: mockCopy, ariaLabel: 'Copy' },
    ],
  }),
);

jest.mock('@/object-record/record-field/ui/hooks/useIsFieldEmpty', () => ({
  useIsFieldEmpty: () => false,
}));

jest.mock('@/object-record/record-field/ui/hooks/useIsFieldInputOnly', () => ({
  useIsFieldInputOnly: () => false,
}));

jest.mock('@/object-record/record-field/ui/components/FieldInput', () => ({
  FieldInput: () => null,
}));

jest.mock('@/object-record/record-field/ui/components/FieldDisplay', () => ({
  FieldDisplay: () => (
    <>
      <span>Field value</span>
      {createPortal(<span>Dropdown option</span>, document.body)}
    </>
  ),
}));

const fieldContextValue = {
  recordId: 'record-id',
  isLabelIdentifier: false,
  isRecordFieldReadOnly: false,
  fieldDefinition: { metadata: { fieldName: 'amount' } },
} as GenericFieldContextType;

const renderHoveredPortalContent = () =>
  render(
    <JotaiProvider store={createStore()}>
      <I18nProvider i18n={i18n}>
        <RecordBoardComponentInstanceContext.Provider
          value={{ instanceId: 'record-board' }}
        >
          <RecordBoardCardComponentInstanceContext.Provider
            value={{ instanceId: 'record-board-card' }}
          >
            <FieldContext.Provider value={fieldContextValue}>
              <RecordBoardCardCellHoveredPortalContent />
            </FieldContext.Provider>
          </RecordBoardCardComponentInstanceContext.Provider>
        </RecordBoardComponentInstanceContext.Provider>
      </I18nProvider>
    </JotaiProvider>,
  );

const getHoveredBackground = () => {
  const hoveredBackground = screen
    .getByText('Field value')
    .closest('[data-inline-cell-display-mode]')?.parentElement;

  if (!(hoveredBackground instanceof HTMLElement)) {
    throw new Error('Missing hovered field background');
  }

  return hoveredBackground;
};

describe('RecordBoardCardCellHoveredPortalContent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should open the record once when the hovered background is clicked', async () => {
    const user = userEvent.setup();
    renderHoveredPortalContent();

    await user.click(getHoveredBackground());

    expect(mockOpenRecordBoardCard).toHaveBeenCalledTimes(1);
    expect(mockOpenFieldInput).not.toHaveBeenCalled();
  });

  it('should open the field editor and not the record when the value is clicked', async () => {
    const user = userEvent.setup();
    renderHoveredPortalContent();

    await user.click(screen.getByText('Field value'));

    expect(mockOpenFieldInput).toHaveBeenCalledTimes(1);
    expect(mockOpenRecordBoardCard).not.toHaveBeenCalled();
  });

  it('should not open the record when a field button is clicked', async () => {
    const user = userEvent.setup();
    renderHoveredPortalContent();

    await user.click(screen.getByRole('button', { name: 'Copy' }));

    expect(mockCopy).toHaveBeenCalledTimes(1);
    expect(mockOpenRecordBoardCard).not.toHaveBeenCalled();
  });

  it('should not open the record when a portalled option is clicked', async () => {
    const user = userEvent.setup();
    renderHoveredPortalContent();

    await user.click(screen.getByText('Dropdown option'));

    expect(mockOpenRecordBoardCard).not.toHaveBeenCalled();
  });
});
