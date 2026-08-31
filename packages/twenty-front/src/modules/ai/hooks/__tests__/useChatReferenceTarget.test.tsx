import { act, renderHook } from '@testing-library/react';

import { useChatReferenceTarget } from '@/ai/hooks/useChatReferenceTarget';
import { type ChatReferenceIdentity } from '@/ai/types/ChatReferenceIdentity';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { type ViewWithRelations } from '@/views/types/ViewWithRelations';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';
import { setTestViewsInMetadataStore } from '~/testing/utils/setTestViewsInMetadataStore';

const openWorkspaceTargetMock = jest.fn();

jest.mock('@/navigation/hooks/useOpenWorkspaceTarget', () => ({
  useOpenWorkspaceTarget: () => ({
    openWorkspaceTarget: openWorkspaceTargetMock,
  }),
}));

jest.mock('@/settings/roles/hooks/useHasPermissionFlag');

const mockUseHasPermissionFlag = useHasPermissionFlag as jest.Mock;

const companyObjectMetadataItem = getMockObjectMetadataItemOrThrow('company');
const companyNameFieldMetadataItem = companyObjectMetadataItem.fields.find(
  (field) => field.name === 'name',
);

const RECORD_ID = '11111111-1111-4111-8111-111111111111';
const VIEW_ID = '44444444-4444-4444-4444-444444444444';

const allCompaniesView = {
  id: VIEW_ID,
  name: 'All Companies',
  icon: 'IconBuildingSkyscraper',
  objectMetadataId: companyObjectMetadataItem.id,
  isActive: true,
} as ViewWithRelations;

const renderChatReferenceTarget = (reference: ChatReferenceIdentity) => {
  const wrapper = getJestMetadataAndApolloMocksWrapper({
    apolloMocks: [],
    onInitializeJotaiStore: (store) =>
      setTestViewsInMetadataStore(store, [allCompaniesView]),
  });

  return renderHook(() => useChatReferenceTarget(reference), { wrapper });
};

describe('useChatReferenceTarget', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseHasPermissionFlag.mockReturnValue(true);
    window.history.pushState({}, '', '/objects/companies');
  });

  it('should link a record to its show page', () => {
    const { result } = renderChatReferenceTarget({
      kind: 'record',
      objectNameSingular: 'company',
      recordId: RECORD_ID,
    });

    expect(result.current.to).toBe(`/object/company/${RECORD_ID}`);
    expect(result.current.onClick).toBeDefined();
  });

  it('should link an object to its record index page', () => {
    const { result } = renderChatReferenceTarget({
      kind: 'object',
      objectNameSingular: 'company',
    });

    expect(result.current.to).toBe('/objects/companies');
  });

  it('should link a view to its object index page', () => {
    const { result } = renderChatReferenceTarget({
      kind: 'view',
      viewId: VIEW_ID,
    });

    expect(result.current.to).toBe(`/objects/companies?viewId=${VIEW_ID}`);
  });

  it('should link a field to its settings page', () => {
    const { result } = renderChatReferenceTarget({
      kind: 'field',
      objectNameSingular: 'company',
      fieldName: 'name',
    });

    expect(result.current.to).toBe('/settings/objects/companies/name');
    expect(result.current.fieldMetadataItem?.id).toBe(
      companyNameFieldMetadataItem?.id,
    );
  });

  it('should leave a field inert without the data model permission', () => {
    mockUseHasPermissionFlag.mockReturnValue(false);

    const { result } = renderChatReferenceTarget({
      kind: 'field',
      objectNameSingular: 'company',
      fieldName: 'name',
    });

    expect(result.current.to).toBeUndefined();
    expect(result.current.onClick).toBeUndefined();
    expect(result.current.fieldMetadataItem?.id).toBe(
      companyNameFieldMetadataItem?.id,
    );
  });

  it('should leave an object the assistant only proposes creating inert', () => {
    const { result } = renderChatReferenceTarget({
      kind: 'object',
      objectNameSingular: 'partner',
    });

    expect(result.current.to).toBeUndefined();
    expect(result.current.onClick).toBeUndefined();
  });

  it('should open a field beside the conversation on the chat page', () => {
    window.history.pushState({}, '', '/chat');

    const { result } = renderChatReferenceTarget({
      kind: 'field',
      objectNameSingular: 'company',
      fieldName: 'name',
    });

    act(() => result.current.onClick?.());

    expect(openWorkspaceTargetMock).toHaveBeenCalledWith({
      path: '/settings/objects/companies/name',
    });
  });

  it('should open a record beside the conversation on the chat page', () => {
    window.history.pushState({}, '', '/chat');

    const { result } = renderChatReferenceTarget({
      kind: 'record',
      objectNameSingular: 'company',
      recordId: RECORD_ID,
    });

    act(() => result.current.onClick?.());

    expect(openWorkspaceTargetMock).toHaveBeenCalledWith({
      path: `/object/company/${RECORD_ID}`,
    });
  });

  it('should open a view beside the conversation on the chat page', () => {
    window.history.pushState({}, '', '/chat');

    const { result } = renderChatReferenceTarget({
      kind: 'view',
      viewId: VIEW_ID,
    });

    act(() => result.current.onClick?.());

    expect(openWorkspaceTargetMock).toHaveBeenCalledWith({
      path: `/objects/companies?viewId=${VIEW_ID}`,
    });
  });
});
