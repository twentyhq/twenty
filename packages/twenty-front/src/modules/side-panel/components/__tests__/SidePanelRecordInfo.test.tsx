import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { SidePanelRecordInfo } from '@/side-panel/components/SidePanelRecordInfo';
import { viewableRecordIdComponentState } from '@/side-panel/pages/record-page/states/viewableRecordIdComponentState';
import { viewableRecordNameSingularComponentState } from '@/side-panel/pages/record-page/states/viewableRecordNameSingularComponentState';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import { createStore, Provider as JotaiProvider } from 'jotai';
import { MemoryRouter } from 'react-router-dom';

const SIDE_PANEL_PAGE_INSTANCE_ID = 'side-panel-record';
const RECORD_ID = 'company-record';

let mockIsTitleReadOnly = false;

jest.mock('@/object-record/record-show/hooks/useRecordShowPage', () => ({
  useRecordShowPage: (objectNameSingular: string, objectRecordId: string) => ({
    objectNameSingular,
    objectRecordId,
  }),
}));

jest.mock('@/object-record/record-show/hooks/useRecordIdentifierTitle', () => ({
  useRecordIdentifierTitle: () => ({
    recordIdentifier: { name: 'Acme', avatarType: 'rounded', avatarUrl: '' },
    titleFieldContextValue: {
      recordId: RECORD_ID,
      isRecordFieldReadOnly: mockIsTitleReadOnly,
    },
  }),
}));

jest.mock(
  '@/object-record/record-title-cell/components/RecordTitleCell',
  () => ({
    RecordTitleCell: () => <span>Acme</span>,
  }),
);

const renderRecordInfo = (
  createdAt: string | null = '2026-08-25T12:00:00.000Z',
) => {
  const store = createStore();

  store.set(
    viewableRecordNameSingularComponentState.atomFamily({
      instanceId: SIDE_PANEL_PAGE_INSTANCE_ID,
    }),
    'company',
  );
  store.set(
    viewableRecordIdComponentState.atomFamily({
      instanceId: SIDE_PANEL_PAGE_INSTANCE_ID,
    }),
    RECORD_ID,
  );
  store.set(recordStoreFamilyState.atomFamily(RECORD_ID), {
    __typename: 'Company',
    id: RECORD_ID,
    createdAt,
  });

  render(
    <MemoryRouter>
      <I18nProvider i18n={i18n}>
        <JotaiProvider store={store}>
          <SidePanelRecordInfo
            sidePanelPageInstanceId={SIDE_PANEL_PAGE_INSTANCE_ID}
          />
        </JotaiProvider>
      </I18nProvider>
    </MemoryRouter>,
  );
};

describe('SidePanelRecordInfo', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-08-27T12:00:00.000Z'));
    mockIsTitleReadOnly = false;
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('uses the shared H3 title and keeps the date without linking editable titles', () => {
    renderRecordInfo();

    expect(
      screen.getByRole('heading', { level: 3, name: 'Acme' }),
    ).toBeVisible();
    expect(screen.getByText('Created 2 days ago')).toBeVisible();
    expect(
      screen.queryByRole('link', { name: 'Acme' }),
    ).not.toBeInTheDocument();
  });

  it('preserves navigation to the record for read-only titles', () => {
    mockIsTitleReadOnly = true;

    renderRecordInfo();

    expect(screen.getByRole('link', { name: 'Acme' })).toHaveAttribute(
      'href',
      `/object/company/${RECORD_ID}`,
    );
  });

  it('omits the creation label when the record has no creation date', () => {
    renderRecordInfo(null);

    expect(
      screen.getByRole('heading', { level: 3, name: 'Acme' }),
    ).toBeVisible();
    expect(screen.queryByText(/^Created /)).not.toBeInTheDocument();
  });
});
