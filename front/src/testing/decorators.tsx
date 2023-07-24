import { ApolloProvider } from '@apollo/client';
import { Decorator } from '@storybook/react';
import { RecoilRoot } from 'recoil';

import { ColumnIndexContext } from '../modules/ui/table/states/ColumnIndexContext';
import { RowIndexContext } from '../modules/ui/table/states/RowIndexContext';

import { ComponentStorybookLayout } from './ComponentStorybookLayout';
import { mockedClient } from './mockedClient';

export const RootDecorator: Decorator = (Story) => (
  <RecoilRoot>
    <ApolloProvider client={mockedClient}>
      <Story />
    </ApolloProvider>
  </RecoilRoot>
);

export const ComponentDecorator: Decorator = (Story) => (
  <ComponentStorybookLayout>
    <Story />
  </ComponentStorybookLayout>
);

export const CellPositionDecorator: Decorator = (Story) => (
  <RowIndexContext.Provider value={1}>
    <ColumnIndexContext.Provider value={1}>
      <Story />
    </ColumnIndexContext.Provider>
  </RowIndexContext.Provider>
);
