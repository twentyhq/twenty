import { SidePanelRecordCreationFormPage } from '@/side-panel/pages/record-creation-form/components/SidePanelRecordCreationFormPage';
import { SIDE_PANEL_FOCUS_ID } from '@/side-panel/constants/SidePanelFocusId';
import { act, render, screen } from '@testing-library/react';
import { type ReactNode } from 'react';
import { Key } from 'ts-key-enum';

const mockUseHotkeysOnFocusedElement = jest.fn();
const mockSettleRecordCreationDraft = jest.fn();
const mockGoBackFromSidePanel = jest.fn();

jest.mock('@/ui/utilities/hotkey/hooks/useHotkeysOnFocusedElement', () => ({
  useHotkeysOnFocusedElement: (options: unknown) =>
    mockUseHotkeysOnFocusedElement(options),
}));
jest.mock(
  '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue',
  () => ({
    useAtomComponentStateValue: () => ({
      requestId: 'request-id',
      objectMetadataId: 'company-object-id',
      initialDraftRecord: {},
    }),
  }),
);
jest.mock('@/ui/utilities/state/jotai/hooks/useAtomComponentState', () => ({
  useAtomComponentState: () => [null, jest.fn()],
}));
jest.mock('@/object-metadata/hooks/useObjectMetadataItemById', () => ({
  useObjectMetadataItemById: () => ({
    objectMetadataItem: { id: 'company-object-id' },
  }),
}));
jest.mock('@/object-metadata/hooks/useObjectMetadataItems', () => ({
  useObjectMetadataItems: () => ({ objectMetadataItems: [] }),
}));
jest.mock(
  '@/object-record/record-form/hooks/useRecordFormFieldMetadataItems',
  () => ({
    useRecordFormFieldMetadataItems: () => ({
      recordFormFieldMetadataItems: [],
    }),
  }),
);
jest.mock(
  '@/object-record/record-form/hooks/useRecordCreationFormSettle',
  () => ({
    useRecordCreationFormSettle: () => ({
      settleRecordCreationDraft: mockSettleRecordCreationDraft,
    }),
  }),
);
jest.mock('@/side-panel/hooks/useSidePanelHistory', () => ({
  useSidePanelHistory: () => ({
    goBackFromSidePanel: mockGoBackFromSidePanel,
  }),
}));
jest.mock(
  '@/object-record/record-form/components/RecordFormFieldInputs',
  () => ({ RecordFormFieldInputs: () => null }),
);
jest.mock('@/ui/layout/side-panel/components/SidePanelFooter', () => ({
  SidePanelFooter: ({ actions }: { actions: ReactNode[] }) => <>{actions}</>,
}));
jest.mock('twenty-ui/utilities', () => ({
  getOsControlSymbol: () => '⌘',
}));

describe('SidePanelRecordCreationFormPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('displays and handles the command-enter shortcut', () => {
    render(<SidePanelRecordCreationFormPage />);

    expect(
      screen.getByTestId('record-creation-form-create-button'),
    ).toHaveTextContent('⌘ ⏎');
    expect(mockUseHotkeysOnFocusedElement).toHaveBeenCalledWith({
      keys: [`${Key.Control}+${Key.Enter}`, `${Key.Meta}+${Key.Enter}`],
      callback: expect.any(Function),
      focusId: SIDE_PANEL_FOCUS_ID,
      dependencies: [expect.any(Function)],
    });

    const [{ callback }] = mockUseHotkeysOnFocusedElement.mock.calls[0];

    act(() => callback());

    expect(mockSettleRecordCreationDraft).toHaveBeenCalledTimes(1);
    expect(mockGoBackFromSidePanel).toHaveBeenCalledTimes(1);
  });
});
