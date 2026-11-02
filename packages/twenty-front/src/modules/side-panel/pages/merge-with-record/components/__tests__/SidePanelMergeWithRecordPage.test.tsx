import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { SOURCE_LOCALE } from 'twenty-shared/translations';
import { ToastProvider } from 'twenty-ui/components/feedback';

import { SidePanelMergeWithRecordPage } from '@/side-panel/pages/merge-with-record/components/SidePanelMergeWithRecordPage';
import { mergeWithRecordSourceComponentState } from '@/side-panel/pages/merge-with-record/states/mergeWithRecordSourceComponentState';
import { SidePanelPageComponentInstanceContext } from '@/side-panel/states/contexts/SidePanelPageComponentInstanceContext';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';
import { messages } from '~/locales/generated/en';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

i18n.load({ [SOURCE_LOCALE]: messages });
i18n.activate(SOURCE_LOCALE);

const companyObjectMetadataItem = getMockObjectMetadataItemOrThrow('company');
const CURRENT_RECORD_ID = 'acme-1';
const PICKED_RECORD_ID = 'acme-2';

const openMergeRecordsPageInSidePanel = jest.fn();

jest.mock('@/side-panel/hooks/useOpenMergeRecordsPageInSidePanel', () => ({
  useOpenMergeRecordsPageInSidePanel: () => ({
    openMergeRecordsPageInSidePanel,
  }),
}));

jest.mock('@/object-record/hooks/useObjectRecordSearchRecords', () => ({
  useObjectRecordSearchRecords: () => ({
    searchRecords: [
      {
        recordId: PICKED_RECORD_ID,
        objectNameSingular: companyObjectMetadataItem.nameSingular,
        label: 'Acme Inc',
        imageUrl: null,
      },
    ],
    loading: false,
    error: undefined,
  }),
}));

jest.mock('@/object-metadata/hooks/useObjectMetadataItem', () => ({
  useObjectMetadataItem: () => ({
    objectMetadataItem: companyObjectMetadataItem,
  }),
}));

const PAGE_ID = 'merge-with-page';

const Wrapper = ({ children }: { children: ReactNode }) => (
  <JotaiProvider store={jotaiStore}>
    <I18nProvider i18n={i18n}>
      <SidePanelPageComponentInstanceContext.Provider
        value={{ instanceId: PAGE_ID }}
      >
        <ToastProvider>
          <MemoryRouter>{children}</MemoryRouter>
        </ToastProvider>
      </SidePanelPageComponentInstanceContext.Provider>
    </I18nProvider>
  </JotaiProvider>
);

const setMergeWithRecordSource = () =>
  jotaiStore.set(
    mergeWithRecordSourceComponentState.atomFamily({ instanceId: PAGE_ID }),
    {
      objectNameSingular: companyObjectMetadataItem.nameSingular,
      recordId: CURRENT_RECORD_ID,
    },
  );

describe('SidePanelMergeWithRecordPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetJotaiStore();
  });

  it('opens the merge of the current record with the picked one', async () => {
    setMergeWithRecordSource();

    render(<SidePanelMergeWithRecordPage />, { wrapper: Wrapper });

    await userEvent.click(screen.getByText('Acme Inc'));

    expect(openMergeRecordsPageInSidePanel).toHaveBeenCalledWith([
      CURRENT_RECORD_ID,
      PICKED_RECORD_ID,
    ]);
  });

  it('opens a single merge when the record is clicked twice while loading', async () => {
    openMergeRecordsPageInSidePanel.mockReturnValue(new Promise(() => {}));
    setMergeWithRecordSource();

    render(<SidePanelMergeWithRecordPage />, { wrapper: Wrapper });

    await userEvent.dblClick(screen.getByText('Acme Inc'));

    expect(openMergeRecordsPageInSidePanel).toHaveBeenCalledTimes(1);
  });

  it('renders nothing without a record to merge from', () => {
    const { container } = render(<SidePanelMergeWithRecordPage />, {
      wrapper: Wrapper,
    });

    expect(container).toBeEmptyDOMElement();
  });
});
