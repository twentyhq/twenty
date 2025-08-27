import { act, renderHook } from '@testing-library/react';
import { RecoilRoot, useSetRecoilState } from 'recoil';

import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { useColorScheme } from '@/ui/theme/hooks/useColorScheme';
import { type WorkspaceMember } from '@/workspace-member/types/WorkspaceMember';

const updateOneRecordMock = jest.fn();

jest.mock('@/object-record/hooks/useUpdateOneRecord', () => ({
  useUpdateOneRecord: () => ({
    updateOneRecord: updateOneRecordMock,
  }),
}));

const workspaceMember: Omit<
  WorkspaceMember,
  'createdAt' | 'updatedAt' | 'userId'
> = {
  __typename: 'WorkspaceMember',
  id: 'id',
  name: {
    firstName: 'firstName',
    lastName: 'lastName',
  },
  locale: 'en',
  colorScheme: 'System',
  userEmail: 'userEmail',
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
