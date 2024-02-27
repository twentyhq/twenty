import { ReactNode } from 'react';
import { MockedProvider } from '@apollo/client/testing';
import { renderHook } from '@testing-library/react';
import { RecoilRoot, useSetRecoilState } from 'recoil';

import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { getObjectMetadataItemsMock } from '@/object-metadata/utils/getObjectMetadataItemsMock';
import {
  mockedCompanyObjectMetadataItem,
  mockedPersonObjectMetadataItem,
} from '@/object-record/record-field/__mocks__/fieldDefinitions';
import { SnackBarProviderScope } from '@/ui/feedback/snack-bar-manager/scopes/SnackBarProviderScope';

import { getFieldDefaultPreviewValue } from '../getFieldDefaultPreviewValue';

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

describe('getFieldDefaultPreviewValue', () => {
  it('returns the object singular name as default value for the label identifier field (type TEXT)', () => {
    const objectMetadataItem = mockedCompanyObjectMetadataItem;
    const fieldMetadataItem = mockedCompanyObjectMetadataItem.fields.find(
      ({ name }) => name === 'name',
    )!;
    const { result } = renderHook(
      () => {
        const setMetadataItems = useSetRecoilState(objectMetadataItemsState);
        setMetadataItems(mockObjectMetadataItems);

        return getFieldDefaultPreviewValue({
          objectMetadataItem,
          fieldMetadataItem,
        });
      },
      { wrapper: Wrapper },
    );

    expect(result.current).toEqual('Company');
  });

  it('returns a default value for the label identifier field (type FULL_NAME)', () => {
    const objectMetadataItem = mockedPersonObjectMetadataItem;
    const fieldMetadataItem = mockedPersonObjectMetadataItem.fields.find(
      ({ name }) => name === 'name',
    )!;
    const { result } = renderHook(
      () => {
        const setMetadataItems = useSetRecoilState(objectMetadataItemsState);
        setMetadataItems(mockObjectMetadataItems);

        return getFieldDefaultPreviewValue({
          objectMetadataItem,
          fieldMetadataItem,
        });
      },
      { wrapper: Wrapper },
    );

    expect(result.current).toEqual({
      firstName: 'John',
      lastName: 'Doe',
    });
  });

  it('returns a default relation record for a RELATION field', () => {
    const objectMetadataItem = mockedCompanyObjectMetadataItem;
    const fieldMetadataItem = mockedCompanyObjectMetadataItem.fields.find(
      ({ name }) => name === 'people',
    )!;
    const relationObjectMetadataItem = mockedPersonObjectMetadataItem;
    const { result } = renderHook(
      () => {
        const setMetadataItems = useSetRecoilState(objectMetadataItemsState);
        setMetadataItems(mockObjectMetadataItems);

        return getFieldDefaultPreviewValue({
          objectMetadataItem,
          fieldMetadataItem,
          relationObjectMetadataItem,
        });
      },
      { wrapper: Wrapper },
    );

    expect(result.current).toEqual({
      name: {
        firstName: 'John',
        lastName: 'Doe',
      },
    });
  });

  it('returns a default value for other field types', () => {
    const objectMetadataItem = mockedCompanyObjectMetadataItem;
    const fieldMetadataItem = mockedCompanyObjectMetadataItem.fields.find(
      ({ name }) => name === 'domainName',
    )!;
    const { result } = renderHook(
      () => {
        const setMetadataItems = useSetRecoilState(objectMetadataItemsState);
        setMetadataItems(mockObjectMetadataItems);

        return getFieldDefaultPreviewValue({
          objectMetadataItem,
          fieldMetadataItem,
        });
      },
      { wrapper: Wrapper },
    );

    expect(result.current).toEqual(
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum magna enim, dapibus non enim in, lacinia faucibus nunc. Sed interdum ante sed felis facilisis, eget ultricies neque molestie. Mauris auctor, justo eu volutpat cursus, libero erat tempus nulla, non sodales lorem lacus a est.',
    );
  });
});
