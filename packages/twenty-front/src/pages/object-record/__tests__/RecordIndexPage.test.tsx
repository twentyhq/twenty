import { render, screen } from '@testing-library/react';

import { RecordIndexPage } from '~/pages/object-record/RecordIndexPage';

const mockUseIsFeatureEnabled = jest.fn();
const mockUseAtomComponentStateValue = jest.fn();
const mockUseObjectMetadataItems = jest.fn();

jest.mock('@/workspace/hooks/useIsFeatureEnabled', () => ({
  useIsFeatureEnabled: (featureFlagKey: string) =>
    mockUseIsFeatureEnabled(featureFlagKey),
}));

jest.mock(
  '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue',
  () => ({
    useAtomComponentStateValue: () => mockUseAtomComponentStateValue(),
  }),
);

jest.mock('@/object-metadata/hooks/useObjectMetadataItems', () => ({
  useObjectMetadataItems: () => mockUseObjectMetadataItems(),
}));

jest.mock('~/pages/object-core/WorkflowCoreIndexPage', () => ({
  WorkflowCoreIndexPage: () => <div>core-workflows-index</div>,
}));

jest.mock(
  '@/object-record/record-index/components/RecordIndexContainerGater',
  () => ({
    RecordIndexContainerGater: () => <div>record-index</div>,
  }),
);

const WORKFLOW_OBJECT_METADATA_ID = 'workflow-object-metadata-id';
const COMPANY_OBJECT_METADATA_ID = 'company-object-metadata-id';

describe('RecordIndexPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseObjectMetadataItems.mockReturnValue({
      objectMetadataItems: [
        { id: WORKFLOW_OBJECT_METADATA_ID, nameSingular: 'workflow' },
        { id: COMPANY_OBJECT_METADATA_ID, nameSingular: 'company' },
      ],
    });
  });

  it('should render the core workflows index for the workflow object when the flag is on', () => {
    mockUseAtomComponentStateValue.mockReturnValue(WORKFLOW_OBJECT_METADATA_ID);
    mockUseIsFeatureEnabled.mockImplementation(
      (featureFlagKey: string) =>
        featureFlagKey === 'IS_WORKFLOW_CORE_INDEX_PAGE_ENABLED',
    );

    render(<RecordIndexPage />);

    expect(screen.getByText('core-workflows-index')).toBeInTheDocument();
    expect(screen.queryByText('record-index')).not.toBeInTheDocument();
  });

  it('should render the record index for the workflow object when the flag is off', () => {
    mockUseAtomComponentStateValue.mockReturnValue(WORKFLOW_OBJECT_METADATA_ID);
    mockUseIsFeatureEnabled.mockReturnValue(false);

    render(<RecordIndexPage />);

    expect(screen.getByText('record-index')).toBeInTheDocument();
    expect(screen.queryByText('core-workflows-index')).not.toBeInTheDocument();
  });

  it('should render the record index for other objects when the flag is on', () => {
    mockUseAtomComponentStateValue.mockReturnValue(COMPANY_OBJECT_METADATA_ID);
    mockUseIsFeatureEnabled.mockReturnValue(true);

    render(<RecordIndexPage />);

    expect(screen.getByText('record-index')).toBeInTheDocument();
    expect(screen.queryByText('core-workflows-index')).not.toBeInTheDocument();
  });
});
