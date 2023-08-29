import { View } from '~/generated/graphql';

type MockedView = Pick<View, 'id' | 'name'>;

export const mockedViews: Array<MockedView> = [
  {
    id: '89bb825c-171e-4bcc-9cf7-43448d6fb230a',
    name: 'All',
  },
  {
    id: '89bb825c-171e-4bcc-9cf7-43448d6fb230a',
    name: 'View example 1',
  },
];
