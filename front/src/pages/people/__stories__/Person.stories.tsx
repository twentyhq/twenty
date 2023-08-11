import type { Meta, StoryObj } from '@storybook/react';

import { AppPath } from '@/types/AppPath';
import {
  PageDecorator,
  type PageDecoratorArgs,
} from '~/testing/decorators/PageDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';
import { mockedPeopleData } from '~/testing/mock-data/people';

import { PersonShow } from '../PersonShow';

const meta: Meta<PageDecoratorArgs> = {
  title: 'Pages/People/Person',
  component: PersonShow,
  decorators: [PageDecorator],
  args: { currentPath: AppPath.PersonShowPage, id: mockedPeopleData[0].id },
  parameters: {
    docs: { story: 'inline', iframeHeight: '500px' },
    msw: graphqlMocks,
  },
};

export default meta;

export type Story = StoryObj<typeof PersonShow>;

export const Default: Story = {};
