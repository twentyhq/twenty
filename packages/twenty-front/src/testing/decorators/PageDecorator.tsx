import { useEffect } from 'react';
import { HelmetProvider } from 'react-helmet-async';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ApolloProvider } from '@apollo/client';
import { Decorator } from '@storybook/react';
import { RecoilRoot, useRecoilState } from 'recoil';

import { ApolloMetadataClientProvider } from '@/object-metadata/components/ApolloMetadataClientProvider';
import { useFindManyObjectMetadataItems } from '@/object-metadata/hooks/useFindManyObjectMetadataItems';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { RelationPickerScope } from '@/object-record/relation-picker/scopes/RelationPickerScope';
import { SnackBarProviderScope } from '@/ui/feedback/snack-bar-manager/scopes/SnackBarProviderScope';
import { ClientConfigProvider } from '~/modules/client-config/components/ClientConfigProvider';
import { DefaultLayout } from '~/modules/ui/layout/page/DefaultLayout';
import { UserProvider } from '~/modules/users/components/UserProvider';
import { mockedClient } from '~/testing/mockedClient';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

import { FullHeightStorybookLayout } from '../FullHeightStorybookLayout';

export type PageDecoratorArgs = {
  routePath: string;
  routeParams: RouteParams;
};

type RouteParams = {
  [param: string]: string;
};

const computeLocation = (routePath: string, routeParams: RouteParams) => {
  return {
    pathname: routePath.replace(
      /:(\w+)/g,
      (paramName) => routeParams[paramName] ?? '',
    ),
  };
};

const ObjectMetadata = ({ children }: { children: JSX.Element }) => {
  const { objectMetadataItems: newObjectMetadataItems } =
    useFindManyObjectMetadataItems();

  const [objectMetadataItems, setObjectMetadataItems] = useRecoilState(
    objectMetadataItemsState,
  );

  useEffect(() => {
    if (!isDeeplyEqual(objectMetadataItems, newObjectMetadataItems)) {
      setObjectMetadataItems(newObjectMetadataItems);
    }
  }, [newObjectMetadataItems, objectMetadataItems, setObjectMetadataItems]);

  return objectMetadataItems.length < 1 ? <></> : children;
};

export const PageDecorator: Decorator<{
  routePath: string;
  routeParams: RouteParams;
}> = (Story, { args }) => (
  <RecoilRoot>
    <ApolloProvider client={mockedClient}>
      <ApolloMetadataClientProvider>
        <UserProvider>
          <ClientConfigProvider>
            <MemoryRouter
              initialEntries={[
                computeLocation(args.routePath, args.routeParams),
              ]}
            >
              <FullHeightStorybookLayout>
                <HelmetProvider>
                  <SnackBarProviderScope snackBarManagerScopeId="snack-bar-manager">
                    <RelationPickerScope relationPickerScopeId="relation-picker">
                      <ObjectMetadata>
                        <DefaultLayout>
                          <Routes>
                            <Route path={args.routePath} element={<Story />} />
                          </Routes>
                        </DefaultLayout>
                      </ObjectMetadata>
                    </RelationPickerScope>
                  </SnackBarProviderScope>
                </HelmetProvider>
              </FullHeightStorybookLayout>
            </MemoryRouter>
          </ClientConfigProvider>
        </UserProvider>
      </ApolloMetadataClientProvider>
    </ApolloProvider>
  </RecoilRoot>
);
