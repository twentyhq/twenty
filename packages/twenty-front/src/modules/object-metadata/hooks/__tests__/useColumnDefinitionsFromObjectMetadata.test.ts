import { renderHook } from '@testing-library/react';

import {
  AUTO_SELECT_FAST_MODEL_ID,
  AUTO_SELECT_SMART_MODEL_ID,
} from 'twenty-shared/constants';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { CUSTOM_WORKSPACE_APPLICATION_MOCK } from '@/object-metadata/hooks/__tests__/constants/CustomWorkspaceApplicationMock.test.constant';
import { useColumnDefinitionsFromObjectMetadata } from '@/object-metadata/hooks/useColumnDefinitionsFromObjectMetadata';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import {
  SubscriptionInterval,
  SubscriptionStatus,
  WorkspaceActivationStatus,
} from '~/generated-metadata/graphql';
import { getJestMetadataAndApolloMocksAndCommandMenuWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksAndCommandMenuWrapper';
import { getTestEnrichedObjectMetadataItemsMock } from '~/testing/utils/getTestEnrichedObjectMetadataItemsMock';

const Wrapper = getJestMetadataAndApolloMocksAndCommandMenuWrapper({
  apolloMocks: [],
  componentInstanceId: 'instanceId',
  contextStoreCurrentObjectMetadataNameSingular: 'company',
});

describe('useColumnDefinitionsFromObjectMetadata', () => {
  it('should return expected definitions', () => {
    jotaiStore.set(currentWorkspaceState.atom, {
      workspaceCustomApplication: {
        id: CUSTOM_WORKSPACE_APPLICATION_MOCK.id,
      },
      id: '1',
      featureFlags: [],
      allowImpersonation: false,
      subdomain: 'test',
      activationStatus: WorkspaceActivationStatus.ACTIVE,
      hasValidEnterpriseKey: false,
      hasValidSignedEnterpriseKey: false,
      hasValidEnterpriseValidityToken: false,
      metadataVersion: 1,
      isPublicInviteLinkEnabled: false,
      isGoogleAuthEnabled: true,
      isMicrosoftAuthEnabled: false,
      isPasswordAuthEnabled: true,
      isCustomDomainEnabled: false,
      isGoogleAuthBypassEnabled: false,
      isMicrosoftAuthBypassEnabled: false,
      isPasswordAuthBypassEnabled: false,
      customDomain: 'my-custom-domain.com',
      workspaceUrls: {
        subdomainUrl: 'https://twenty.twenty.com',
        customUrl: 'https://my-custom-domain.com',
      },
      currentBillingSubscription: {
        id: '1',
        interval: SubscriptionInterval.Month,
        status: SubscriptionStatus.Active,
        metadata: {},
        phases: [],
      },
      billingEntitlements: [],
      billingSubscriptions: [
        {
          id: '1',
          status: SubscriptionStatus.Active,
          metadata: {},
          phases: [],
        },
      ],
      isTwoFactorAuthenticationEnforced: false,
      trashRetentionDays: 14,
      eventLogRetentionDays: 365 * 3,
      fastModel: AUTO_SELECT_FAST_MODEL_ID,
      smartModel: AUTO_SELECT_SMART_MODEL_ID,
      enabledAiModelIds: [],
      useRecommendedModels: true,
    });

    const companyObjectMetadata = getTestEnrichedObjectMetadataItemsMock().find(
      (item) => item.nameSingular === 'company',
    );

    const { result } = renderHook(
      (objectMetadataItem: EnrichedObjectMetadataItem) => {
        return useColumnDefinitionsFromObjectMetadata(objectMetadataItem);
      },
      {
        initialProps: companyObjectMetadata,
        wrapper: Wrapper,
      },
    );

    const { columnDefinitions } = result.current;

    expect(columnDefinitions.length).toBe(25);
  });
});
