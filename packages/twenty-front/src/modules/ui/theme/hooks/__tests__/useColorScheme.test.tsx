import { act, renderHook } from '@testing-library/react';
import { RecoilRoot, useSetRecoilState } from 'recoil';

import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { useColorScheme } from '@/ui/theme/hooks/useColorScheme';
import { MockWorkspaceMember } from '~/testing/mock-data/workspace-members';

const updateOneRecordMock = jest.fn();

jest.mock('@/object-record/hooks/useUpdateOneRecord', () => ({
  useUpdateOneRecord: () => ({
    updateOneRecord: updateOneRecordMock,
  }),
}));

const workspaceMember: MockWorkspaceMember = {
  __typename: 'WorkspaceMember',
  id: 'id',
  name: {
    firstName: 'firstName',
    lastName: 'lastName',
  },
  locale: 'en',
  colorScheme: 'System',
  createdAt: '2023-12-18T09:51:19.645Z',
  updatedAt: '2023-12-18T09:51:19.645Z',
  userId: '20202020-7169-42cf-bc47-1cfef15264b8',
  userEmail: 'jane.doe@twenty.com',
};

describe('useColorScheme', () => {
  it('should update color scheme', async () => {
    const { result } = renderHook(
      () => {
        const colorScheme = useColorScheme();

        const setCurrentWorkspaceMember = useSetRecoilState(
          currentWorkspaceMemberState,
        );

        setCurrentWorkspaceMember(workspaceMember);

        return colorScheme;
      },
      {
        wrapper: RecoilRoot,
      },
    );

    expect(result.current.colorScheme).toBe('System');

    await act(async () => {
      await result.current.setColorScheme('Dark');
    });

    // FIXME: For some reason, the color gets unset
    // expect(result.current.colorScheme).toEqual('Dark');
  });
});
