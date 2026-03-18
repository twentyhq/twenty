import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useCreateNewIndexRecord } from '@/object-record/record-table/hooks/useCreateNewIndexRecord';

const mockCreateOneRecord = jest.fn();
const mockCheckDuplicateCompanies = jest.fn();
const mockGetStoreValue = jest.fn();
const mockSetStoreValue = jest.fn();

jest.mock('uuid', () => ({
  v4: jest.fn(() => 'new-company-id'),
}));

jest.mock('@/command-menu/hooks/useCommandMenu', () => ({
  useCommandMenu: () => ({
    closeCommandMenu: jest.fn(),
  }),
}));

jest.mock('@/command-menu/hooks/useOpenRecordInCommandMenu', () => ({
  useOpenRecordInCommandMenu: () => ({
    openRecordInCommandMenu: jest.fn(),
  }),
}));

jest.mock('@/object-metadata/utils/getLabelIdentifierFieldMetadataItem', () => ({
  getLabelIdentifierFieldMetadataItem: jest.fn(() => undefined),
}));

jest.mock('@/object-record/hooks/useBuildRecordInputFromRLSPredicates', () => ({
  useBuildRecordInputFromRLSPredicates: () => ({
    buildRecordInputFromRLSPredicates: () => ({}),
  }),
}));

jest.mock('@/object-record/hooks/useCreateOneRecord', () => ({
  useCreateOneRecord: () => ({
    createOneRecord: mockCreateOneRecord,
  }),
}));

jest.mock('@/object-record/hooks/useCheckDuplicateCompanies', () => ({
  useCheckDuplicateCompanies: () => ({
    checkDuplicateCompanies: mockCheckDuplicateCompanies,
  }),
}));

jest.mock('@/object-record/record-store/hooks/useUpsertRecordsInStore', () => ({
  useUpsertRecordsInStore: () => ({
    upsertRecordsInStore: jest.fn(),
  }),
}));

jest.mock('@/object-record/record-table/hooks/useBuildRecordInputFromFilters', () => ({
  useBuildRecordInputFromFilters: () => ({
    buildRecordInputFromFilters: () => ({}),
  }),
}));

jest.mock('@/object-record/record-title-cell/hooks/useRecordTitleCell', () => ({
  useRecordTitleCell: () => ({
    openRecordTitleCell: jest.fn(),
  }),
}));

jest.mock('@/object-record/utils/canOpenObjectInSidePanel', () => ({
  canOpenObjectInSidePanel: jest.fn(() => false),
}));

jest.mock('@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateCallbackState', () => ({
  useAtomComponentFamilyStateCallbackState: () => () => 'group-state',
}));

jest.mock('@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue', () => ({
  useAtomComponentSelectorValue: () => [],
}));

jest.mock('@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue', () => ({
  useAtomComponentStateValue: () => undefined,
}));

jest.mock('jotai', () => {
  const actual = jest.requireActual('jotai');

  return {
    ...actual,
    useStore: () => ({
      get: mockGetStoreValue,
      set: mockSetStoreValue,
    }),
  };
});

jest.mock('~/hooks/useNavigateApp', () => ({
  useNavigateApp: () => jest.fn(),
}));

jest.mock('@/object-record/components/CompanyDuplicateWarningModal', () => ({
  CompanyDuplicateWarningModal: ({
    duplicates,
    errorMessage,
    isOpen,
    onCancel,
    onContinueAnyway,
    onNavigateToDuplicate,
    onRetry,
  }) =>
    isOpen ? (
      <div>
        <div>Potential duplicate companies</div>
        {duplicates.map((duplicate) => (
          <div key={duplicate.id}>
            <span>{duplicate.name}</span>
            <span>{duplicate.domainName}</span>
          </div>
        ))}
        {errorMessage ? <div>{errorMessage}</div> : null}
        <button onClick={onNavigateToDuplicate}>Open duplicate</button>
        <button onClick={onContinueAnyway}>Continue anyway</button>
        <button onClick={onRetry}>Retry</button>
        <button onClick={onCancel}>Cancel</button>
      </div>
    ) : null,
}));

const objectMetadataItem = {
  id: 'company-metadata-id',
  nameSingular: CoreObjectNameSingular.Company,
  labelSingular: 'Company',
} as const;

const Harness = () => {
  const { companyDuplicateWarningModal, createNewIndexRecord } =
    useCreateNewIndexRecord({
      objectMetadataItem: objectMetadataItem as any,
    });

  return (
    <>
      <button
        onClick={() =>
          void createNewIndexRecord({
            domainName: 'acme.com',
            name: 'Acme Corp',
          })
        }
      >
        Create
      </button>
      {companyDuplicateWarningModal}
    </>
  );
};

describe('useCreateNewIndexRecord', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetStoreValue.mockReturnValue(null);
    mockCreateOneRecord.mockResolvedValue({
      id: 'new-company-id',
      name: 'Acme Corp',
    });
  });

  it('checks company duplicates before persisting and waits for confirmation', async () => {
    mockCheckDuplicateCompanies.mockResolvedValue([
      {
        domainName: 'acme.com',
        id: 'duplicate-company-id',
        name: 'Acme Corp',
      },
    ]);

    const user = userEvent.setup();

    render(<Harness />);

    await user.click(screen.getByRole('button', { name: 'Create' }));

    expect(mockCheckDuplicateCompanies).toHaveBeenCalledWith({
      domainName: 'acme.com',
      name: 'Acme Corp',
    });
    expect(mockCreateOneRecord).not.toHaveBeenCalled();

    await user.click(
      await screen.findByRole('button', { name: 'Continue anyway' }),
    );

    await waitFor(() => {
      expect(mockCreateOneRecord).toHaveBeenCalledWith({
        domainName: 'acme.com',
        id: 'new-company-id',
        name: 'Acme Corp',
      });
    });
  });

  it('cancels the pending create when navigating to a duplicate company', async () => {
    mockCheckDuplicateCompanies.mockResolvedValue([
      {
        domainName: 'acme.com',
        id: 'duplicate-company-id',
        name: 'Acme Corp',
      },
    ]);

    const user = userEvent.setup();

    render(<Harness />);

    const createPromise = user.click(screen.getByRole('button', { name: 'Create' }));

    await screen.findByRole('button', { name: 'Open duplicate' });
    await user.click(screen.getByRole('button', { name: 'Open duplicate' }));

    await createPromise;

    await waitFor(() => {
      expect(
        screen.queryByText('Potential duplicate companies'),
      ).not.toBeInTheDocument();
    });
    expect(mockCreateOneRecord).not.toHaveBeenCalled();
  });
});
