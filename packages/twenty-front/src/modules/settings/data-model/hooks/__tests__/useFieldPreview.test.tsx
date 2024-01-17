import { ReactNode } from 'react';
import { MockedProvider } from '@apollo/client/testing';
import { renderHook } from '@testing-library/react';
import { RecoilRoot, useSetRecoilState } from 'recoil';

import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { getObjectMetadataItemsMock } from '@/object-metadata/utils/getObjectMetadataItemsMock';
import { SnackBarProviderScope } from '@/ui/feedback/snack-bar-manager/scopes/SnackBarProviderScope';

import { useFieldPreview } from '../useFieldPreview';

const Wrapper = ({ children }: { children: ReactNode }) => (
  <RecoilRoot>
    <MockedProvider addTypename={false}>
      <SnackBarProviderScope snackBarManagerScopeId="snack-bar-manager">
        {children}
      </SnackBarProviderScope>
    </MockedProvider>
  </RecoilRoot>
);

const mockObjectMetadataItems = getObjectMetadataItemsMock();

describe('useFieldPreview', () => {
  it('returns default values', () => {
    const objectMetadataItem = mockObjectMetadataItems[1];
    const fieldMetadata = objectMetadataItem.fields[0];
    const { result } = renderHook(
      () => {
        const setMetadataItems = useSetRecoilState(objectMetadataItemsState);
        setMetadataItems(mockObjectMetadataItems);

        return useFieldPreview({
          objectMetadataId: objectMetadataItem.id,
          fieldMetadata,
        });
      },
      { wrapper: Wrapper },
    );

    expect(result.current.entityId).toBe(`${objectMetadataItem.id}-field-form`);
    expect(result.current.FieldIcon).toBeDefined();
    expect(result.current.fieldName).toBe(fieldMetadata.name);
    expect(result.current.ObjectIcon).toBeDefined();
    expect(result.current.fieldName).toBe(fieldMetadata.name);
    expect(result.current.objectMetadataItem?.id).toBe(objectMetadataItem.id);
    expect(result.current.relationObjectMetadataItem).toBeUndefined();
    expect(result.current.value).toBeDefined();
  });
});
