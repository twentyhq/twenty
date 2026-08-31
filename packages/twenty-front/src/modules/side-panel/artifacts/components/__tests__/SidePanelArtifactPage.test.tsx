import { render, screen } from '@testing-library/react';

import { SidePanelArtifactPage } from '@/side-panel/artifacts/components/SidePanelArtifactPage';
import { type SidePanelArtifact } from '@/side-panel/artifacts/types/SidePanelArtifact';
import { type View } from '@/views/types/View';
import { getMockFieldMetadataItemOrThrow } from '~/testing/utils/getMockFieldMetadataItemOrThrow';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

let mockCurrentArtifact: SidePanelArtifact | null = null;

jest.mock('@/side-panel/artifacts/hooks/useCurrentSidePanelArtifact', () => ({
  useCurrentSidePanelArtifact: () => mockCurrentArtifact,
}));

jest.mock(
  '@/side-panel/pages/record-page/components/SidePanelRecordPage',
  () => ({
    SidePanelRecordPage: ({
      objectNameSingular,
      recordId,
    }: {
      objectNameSingular: string;
      recordId: string;
    }) => (
      <div data-testid="record-artifact">
        {objectNameSingular}:{recordId}
      </div>
    ),
  }),
);

jest.mock(
  '@/side-panel/pages/records-page/components/SidePanelRecordsPage',
  () => ({
    SidePanelRecordsPage: ({
      objectMetadataId,
      viewId,
    }: {
      objectMetadataId: string;
      viewId: string;
    }) => (
      <div data-testid="record-index-artifact">
        {objectMetadataId}:{viewId}
      </div>
    ),
  }),
);

jest.mock(
  '@/side-panel/pages/settings-metadata/components/SidePanelSettingsFieldMetadataPage',
  () => ({
    SidePanelSettingsFieldMetadataPage: ({
      fieldMetadataId,
    }: {
      fieldMetadataId: string;
    }) => <div data-testid="settings-field-artifact">{fieldMetadataId}</div>,
  }),
);

const companyObjectMetadataItem = getMockObjectMetadataItemOrThrow('company');
const nameFieldMetadataItem = getMockFieldMetadataItemOrThrow({
  objectMetadataItem: companyObjectMetadataItem,
  fieldName: 'name',
});

const RECORD_ID = '11111111-1111-4111-8111-111111111111';
const VIEW_ID = '44444444-4444-4444-8444-444444444444';

describe('SidePanelArtifactPage', () => {
  it('renders the native record projection', () => {
    mockCurrentArtifact = {
      kind: 'record',
      artifactPath: `/object/company/${RECORD_ID}`,
      objectMetadataItem: companyObjectMetadataItem,
      recordId: RECORD_ID,
    };

    render(<SidePanelArtifactPage />);

    expect(screen.getByTestId('record-artifact')).toHaveTextContent(
      `company:${RECORD_ID}`,
    );
  });

  it('renders the compact record index projection', () => {
    mockCurrentArtifact = {
      kind: 'recordIndex',
      artifactPath: `/objects/companies?viewId=${VIEW_ID}`,
      objectMetadataItem: companyObjectMetadataItem,
      view: {
        id: VIEW_ID,
      } as View,
    };

    render(<SidePanelArtifactPage />);

    expect(screen.getByTestId('record-index-artifact')).toHaveTextContent(
      `${companyObjectMetadataItem.id}:${VIEW_ID}`,
    );
  });

  it('renders the native field metadata summary', () => {
    mockCurrentArtifact = {
      kind: 'settingsField',
      artifactPath: '/settings/objects/companies/name',
      objectMetadataItem: companyObjectMetadataItem,
      fieldMetadataItem: nameFieldMetadataItem,
    };

    render(<SidePanelArtifactPage />);

    expect(screen.getByTestId('settings-field-artifact')).toHaveTextContent(
      nameFieldMetadataItem.id,
    );
  });

  it('renders nothing for a stale artifact path', () => {
    mockCurrentArtifact = null;

    const { container } = render(<SidePanelArtifactPage />);

    expect(container).toBeEmptyDOMElement();
  });
});
