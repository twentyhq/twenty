import { renderHook } from '@testing-library/react';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useColumnDefinitionsFromFieldMetadata } from '@/object-metadata/hooks/useColumnDefinitionsFromFieldMetadata';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import {
  SubscriptionInterval,
  SubscriptionStatus,
  WorkspaceActivationStatus,
} from '~/generated/graphql';
import { getJestMetadataAndApolloMocksAndActionMenuWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksAndActionMenuWrapper';
import { generatedMockObjectMetadataItems } from '~/testing/mock-data/generatedMockObjectMetadataItems';

const Wrapper = getJestMetadataAndApolloMocksAndActionMenuWrapper({
  apolloMocks: [],
  componentInstanceId: 'instanceId',
  contextStoreCurrentObjectMetadataNameSingular: 'company',
  onInitializeRecoilSnapshot: ({ set }) => {
    set(currentWorkspaceState, {
      id: '1',
      featureFlags: [],
      allowImpersonation: false,
      subdomain: 'test',
      activationStatus: WorkspaceActivationStatus.ACTIVE,
      hasValidEnterpriseKey: false,
      metadataVersion: 1,
      isPublicInviteLinkEnabled: false,
      isGoogleAuthEnabled: true,
      isMicrosoftAuthEnabled: false,
      isPasswordAuthEnabled: true,
      workspaceUrls: {
        subdomainUrl: 'https://twenty.twenty.com',
        customUrl: 'https://my-custom-domain.com',
      },
      currentBillingSubscription: {
        id: '1',
        interval: SubscriptionInterval.Month,
        status: SubscriptionStatus.Active,
      },
      billingSubscriptions: [
        {
          id: '1',
          status: SubscriptionStatus.Active,
        },
      ],
    });
  },
});

describe('useColumnDefinitionsFromFieldMetadata', () => {
  it('should return expected definitions', () => {
    const companyObjectMetadata = generatedMockObjectMetadataItems.find(
      (item) => item.nameSingular === 'company',
    );

    const { result } = renderHook(
      (objectMetadataItem: ObjectMetadataItem) => {
        return useColumnDefinitionsFromFieldMetadata(objectMetadataItem);
      },
      {
        initialProps: companyObjectMetadata,
        wrapper: Wrapper,
      },
    );

    const { columnDefinitions, sortDefinitions } = result.current;

    expect(columnDefinitions.length).toBe(21);
    expect(sortDefinitions.length).toBe(14);
  });
});
