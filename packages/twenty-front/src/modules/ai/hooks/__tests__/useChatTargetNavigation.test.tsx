import { act, renderHook } from '@testing-library/react';
import { type Store } from 'jotai/vanilla/store';

import { useChatTargetNavigation } from '@/ai/hooks/useChatTargetNavigation';
import { shouldOpenAiChatAfterOnboardingState } from '@/onboarding/states/shouldOpenAiChatAfterOnboardingState';
import { SettingsPath } from 'twenty-shared/types';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';
import { getMockFieldMetadataItemOrThrow } from '~/testing/utils/getMockFieldMetadataItemOrThrow';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

const navigateAppMock = jest.fn();
const navigateSettingsMock = jest.fn();
const openSettingsFieldMetadataInSidePanelMock = jest.fn();

jest.mock('~/hooks/useNavigateApp', () => ({
  useNavigateApp: () => navigateAppMock,
}));

jest.mock('~/hooks/useNavigateSettings', () => ({
  useNavigateSettings: () => navigateSettingsMock,
}));

jest.mock('@/side-panel/hooks/useOpenRecordInSidePanel', () => ({
  useOpenRecordInSidePanel: () => ({ openRecordInSidePanel: jest.fn() }),
}));

jest.mock('@/side-panel/hooks/useOpenRecordsInSidePanel', () => ({
  useOpenRecordsInSidePanel: () => ({ openRecordsInSidePanel: jest.fn() }),
}));

jest.mock('@/side-panel/hooks/useOpenSettingsFieldMetadataInSidePanel', () => ({
  useOpenSettingsFieldMetadataInSidePanel: () => ({
    openSettingsFieldMetadataInSidePanel:
      openSettingsFieldMetadataInSidePanelMock,
  }),
}));

const companyObjectMetadataItem = getMockObjectMetadataItemOrThrow('company');
const nameFieldMetadataItem = getMockFieldMetadataItemOrThrow({
  objectMetadataItem: companyObjectMetadataItem,
  fieldName: 'name',
});

const renderChatTargetNavigation = ({
  isOnboardingChat = false,
}: { isOnboardingChat?: boolean } = {}) => {
  const wrapper = getJestMetadataAndApolloMocksWrapper({
    apolloMocks: [],
    onInitializeJotaiStore: (store: Store) =>
      store.set(shouldOpenAiChatAfterOnboardingState.atom, isOnboardingChat),
  });

  return renderHook(() => useChatTargetNavigation(), { wrapper });
};

describe('useChatTargetNavigation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    window.history.pushState({}, '', '/objects/companies');
  });

  it('should open a field beside the conversation on the chat page', () => {
    window.history.pushState({}, '', '/chat');

    const { result } = renderChatTargetNavigation();

    act(() =>
      result.current.openFieldMetadataTarget({
        fieldMetadataId: nameFieldMetadataItem.id,
      }),
    );

    expect(openSettingsFieldMetadataInSidePanelMock).toHaveBeenCalledWith({
      fieldMetadataId: nameFieldMetadataItem.id,
    });
    expect(navigateSettingsMock).not.toHaveBeenCalled();
  });

  it('should navigate to the field settings page outside the chat page', () => {
    const { result } = renderChatTargetNavigation();

    act(() =>
      result.current.openFieldMetadataTarget({
        fieldMetadataId: nameFieldMetadataItem.id,
      }),
    );

    expect(navigateSettingsMock).toHaveBeenCalledWith(
      SettingsPath.ObjectFieldEdit,
      {
        objectNamePlural: companyObjectMetadataItem.namePlural,
        fieldName: nameFieldMetadataItem.name,
      },
    );
    expect(openSettingsFieldMetadataInSidePanelMock).not.toHaveBeenCalled();
  });

  it('should navigate to the field settings page from the onboarding chat, which owns the screen', () => {
    window.history.pushState({}, '', '/chat');

    const { result } = renderChatTargetNavigation({ isOnboardingChat: true });

    act(() =>
      result.current.openFieldMetadataTarget({
        fieldMetadataId: nameFieldMetadataItem.id,
      }),
    );

    expect(navigateSettingsMock).toHaveBeenCalled();
    expect(openSettingsFieldMetadataInSidePanelMock).not.toHaveBeenCalled();
  });
});
