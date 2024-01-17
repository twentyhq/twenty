import { ReactNode } from 'react';
import { MockedProvider } from '@apollo/client/testing';
import { renderHook } from '@testing-library/react';
import { RecoilRoot } from 'recoil';

import { useRecordOptimisticEffect } from '@/object-metadata/hooks/useRecordOptimisticEffect';
import { getObjectMetadataItemsMock } from '@/object-metadata/utils/getObjectMetadataItemsMock';

const mockRegisterOptimisticEffect = jest.fn();

jest.mock('@/apollo/optimistic-effect/hooks/useOptimisticEffect', () => ({
  useOptimisticEffect: jest.fn(() => ({
    registerOptimisticEffect: mockRegisterOptimisticEffect,
    unregisterOptimisticEffect: jest.fn(),
  })),
}));

const Wrapper = ({ children }: { children: ReactNode }) => (
  <RecoilRoot>
    <MockedProvider addTypename={false}>{children}</MockedProvider>
  </RecoilRoot>
);

const mockObjectMetadataItems = getObjectMetadataItemsMock();

describe('useRecordOptimisticEffect', () => {
  it('should work as expected', async () => {
    const objectMetadataItem = mockObjectMetadataItems.find(
      (item) => item.namePlural === 'people',
    )!;

    renderHook(() => useRecordOptimisticEffect({ objectMetadataItem }), {
      wrapper: Wrapper,
    });

    expect(mockRegisterOptimisticEffect).toHaveBeenCalled();
  });
});
