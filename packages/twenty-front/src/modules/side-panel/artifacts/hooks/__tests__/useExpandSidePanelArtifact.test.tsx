import { act, renderHook } from '@testing-library/react';

import { useExpandSidePanelArtifact } from '@/side-panel/artifacts/hooks/useExpandSidePanelArtifact';
import { type SidePanelArtifact } from '@/side-panel/artifacts/types/SidePanelArtifact';
import { type View } from '@/views/types/View';
import { getMockFieldMetadataItemOrThrow } from '~/testing/utils/getMockFieldMetadataItemOrThrow';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

const mockNavigate = jest.fn();
const mockCloseSidePanelMenu = jest.fn();
const mockOpenSettingsMenu = jest.fn();
const mockNavigateToRecordPage = jest.fn();
let mockCurrentArtifact: SidePanelArtifact | null = null;
let mockHasDataModelPermission = true;

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

jest.mock('@lingui/react', () => ({
  ...jest.requireActual('@lingui/react'),
  useLingui: () => ({
    i18n: {
      _: ({ message }: { message: string }) => message,
    },
    t: (parts: TemplateStringsArray) => parts.join(''),
  }),
}));

jest.mock('@/side-panel/artifacts/hooks/useCurrentSidePanelArtifact', () => ({
  useCurrentSidePanelArtifact: () => mockCurrentArtifact,
}));

jest.mock('@/side-panel/hooks/useSidePanelMenu', () => ({
  useSidePanelMenu: () => ({
    closeSidePanelMenu: mockCloseSidePanelMenu,
  }),
}));

jest.mock('@/navigation/hooks/useOpenSettings', () => ({
  useOpenSettingsMenu: () => ({
    openSettingsMenu: mockOpenSettingsMenu,
  }),
}));

jest.mock(
  '@/side-panel/pages/record-page/hooks/useNavigateToRecordPageFromSidePanel',
  () => ({
    useNavigateToRecordPageFromSidePanel: () => ({
      navigateToRecordPage: mockNavigateToRecordPage,
    }),
  }),
);

jest.mock('@/settings/roles/hooks/useHasPermissionFlag', () => ({
  useHasPermissionFlag: () => mockHasDataModelPermission,
}));

const companyObjectMetadataItem = getMockObjectMetadataItemOrThrow('company');
const nameFieldMetadataItem = getMockFieldMetadataItemOrThrow({
  objectMetadataItem: companyObjectMetadataItem,
  fieldName: 'name',
});

const RECORD_ID = '11111111-1111-4111-8111-111111111111';
const VIEW_ID = '44444444-4444-4444-8444-444444444444';

describe('useExpandSidePanelArtifact', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCurrentArtifact = null;
    mockHasDataModelPermission = true;
  });

  it('uses the existing record-page handoff for records', () => {
    mockCurrentArtifact = {
      kind: 'record',
      artifactPath: `/object/company/${RECORD_ID}`,
      objectMetadataItem: companyObjectMetadataItem,
      recordId: RECORD_ID,
    };

    const { result } = renderHook(() => useExpandSidePanelArtifact());

    act(() => result.current?.expand());

    expect(mockNavigateToRecordPage).toHaveBeenCalledWith({
      objectNameSingular: 'company',
      recordId: RECORD_ID,
      artifactPath: `/object/company/${RECORD_ID}`,
    });
  });

  it('expands an index to its exact canonical path and closes the panel', () => {
    const artifactPath = `/objects/companies?viewId=${VIEW_ID}#table`;

    mockCurrentArtifact = {
      kind: 'recordIndex',
      artifactPath,
      objectMetadataItem: companyObjectMetadataItem,
      view: { id: VIEW_ID } as View,
    };

    const { result } = renderHook(() => useExpandSidePanelArtifact());

    act(() => result.current?.expand());

    expect(mockNavigate).toHaveBeenCalledWith(artifactPath);
    expect(mockCloseSidePanelMenu).toHaveBeenCalled();
  });

  it('expands a field through its canonical settings path', () => {
    const artifactPath = '/settings/objects/companies/name?from=chat';

    mockCurrentArtifact = {
      kind: 'settingsField',
      artifactPath,
      objectMetadataItem: companyObjectMetadataItem,
      fieldMetadataItem: nameFieldMetadataItem,
    };

    const { result } = renderHook(() => useExpandSidePanelArtifact());

    act(() => result.current?.expand());

    expect(mockOpenSettingsMenu).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith(artifactPath);
    expect(mockCloseSidePanelMenu).toHaveBeenCalled();
  });

  it('does not expose settings expansion without data model permission', () => {
    mockHasDataModelPermission = false;
    mockCurrentArtifact = {
      kind: 'settingsField',
      artifactPath: '/settings/objects/companies/name',
      objectMetadataItem: companyObjectMetadataItem,
      fieldMetadataItem: nameFieldMetadataItem,
    };

    const { result } = renderHook(() => useExpandSidePanelArtifact());

    expect(result.current).toBeNull();
  });

  it('does not expose expansion for a stale artifact', () => {
    const { result } = renderHook(() => useExpandSidePanelArtifact());

    expect(result.current).toBeNull();
  });
});
