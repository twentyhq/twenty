import { MockedProvider } from '@apollo/client/testing';
import { renderHook } from '@testing-library/react';
import { ReactNode } from 'react';
import { RecoilRoot } from 'recoil';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';

const Wrapper = ({ children }: { children: ReactNode }) => (
  <RecoilRoot>
    <MockedProvider addTypename={false}>{children}</MockedProvider>
  </RecoilRoot>
);

// Split into tests for each new hook
describe('useObjectMetadataItem', () => {
  it('should return correct properties', async () => {
    const { result } = renderHook(
      () => useObjectMetadataItem({ objectNameSingular: 'opportunity' }),
      {
        wrapper: Wrapper,
      },
    );

    const { objectMetadataItem } = result.current;

    expect(objectMetadataItem.id).toBe('b95b3f38-9fc2-4d7e-a823-7791cf13d089');
  });
});
