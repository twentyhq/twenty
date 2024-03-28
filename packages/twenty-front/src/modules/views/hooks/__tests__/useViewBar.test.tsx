import { MemoryRouter } from 'react-router-dom';
import { MockedProvider } from '@apollo/client/testing';
import { RecoilRoot } from 'recoil';
import { v4 as uuidv4 } from 'uuid';

import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { generateDeleteOneRecordMutation } from '@/object-record/utils/generateDeleteOneRecordMutation';
import { ViewScope } from '@/views/scopes/ViewScope';

const mockedUuid = 'mocked-uuid';
jest.mock('uuid');

(uuidv4 as jest.Mock).mockReturnValue(mockedUuid);

const mocks = [
  {
    request: {
      query: generateDeleteOneRecordMutation({
        objectMetadataItem: { nameSingular: 'view' } as ObjectMetadataItem,
      }),
      variables: { idToDelete: mockedUuid },
    },
    result: jest.fn(() => ({
      data: { deleteView: { id: '' } },
    })),
  },
];

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <MemoryRouter
    initialEntries={['/one', '/two', { pathname: '/three' }]}
    initialIndex={1}
  >
    <MockedProvider mocks={mocks} addTypename={false}>
      <RecoilRoot>
        <ViewScope viewScopeId="viewScopeId" onCurrentViewChange={() => {}}>
          {children}
        </ViewScope>
      </RecoilRoot>
    </MockedProvider>
  </MemoryRouter>
);
const _renderHookConfig = {
  wrapper: Wrapper,
};

const _viewBarId = 'viewBarTestId';

describe('useViewBar', () => {
  it('should set and get current view Id', () => {});
});
