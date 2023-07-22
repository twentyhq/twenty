import { ApolloProvider } from '@apollo/client';
import { Decorator } from '@storybook/react';
import { RecoilRoot } from 'recoil';

import { RecoilScope } from '@/ui/recoil-scope/components/RecoilScope';
import { CellContext } from '@/ui/table/states/CellContext';
import { RowContext } from '@/ui/table/states/RowContext';

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
  <RecoilScope SpecificContext={RowContext}>
    <RecoilScope SpecificContext={CellContext}>
      <Story />
    </RecoilScope>
  </RecoilScope>
);
