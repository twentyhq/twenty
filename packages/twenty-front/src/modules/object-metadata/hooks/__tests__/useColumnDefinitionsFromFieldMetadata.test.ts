import { renderHook } from '@testing-library/react';
import { Nullable } from 'twenty-ui';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useColumnDefinitionsFromFieldMetadata } from '@/object-metadata/hooks/useColumnDefinitionsFromFieldMetadata';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import {
  SubscriptionInterval,
  SubscriptionStatus,
  WorkspaceActivationStatus,
} from '~/generated/graphql';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';
import { generatedMockObjectMetadataItems } from '~/testing/mock-data/generatedMockObjectMetadataItems';

const Wrapper = getJestMetadataAndApolloMocksWrapper({
  apolloMocks: [],
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
  it('should return empty definitions if no object is passed', () => {
    const { result } = renderHook(
      (objectMetadataItem?: Nullable<ObjectMetadataItem>) => {
        return useColumnDefinitionsFromFieldMetadata(objectMetadataItem);
      },
      {
        wrapper: Wrapper,
      },
    );

    expect(Array.isArray(result.current.columnDefinitions)).toBe(true);
    expect(Array.isArray(result.current.sortDefinitions)).toBe(true);
    expect(result.current.columnDefinitions.length).toBe(0);
    expect(result.current.sortDefinitions.length).toBe(0);
  });

  it('should return expected definitions', () => {
    const companyObjectMetadata = generatedMockObjectMetadataItems.find(
      (item) => item.nameSingular === 'company',
    );

    const { result } = renderHook(
      (objectMetadataItem?: Nullable<ObjectMetadataItem>) => {
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
