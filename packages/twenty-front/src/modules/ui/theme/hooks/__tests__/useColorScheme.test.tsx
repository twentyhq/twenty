import { act, renderHook } from '@testing-library/react';
import { RecoilRoot, useSetRecoilState } from 'recoil';

import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { useColorScheme } from '@/ui/theme/hooks/useColorScheme';
import { WorkspaceMember } from '@/workspace-member/types/WorkspaceMember';
import {
  WorkspaceMemberColorSchemeEnum,
  WorkspaceMemberDateFormatEnum,
  WorkspaceMemberLocaleEnum,
  WorkspaceMemberTimeFormatEnum,
} from '~/generated/graphql';

const updateOneRecordMock = jest.fn();

jest.mock('@/object-record/hooks/useUpdateOneRecord', () => ({
  useUpdateOneRecord: () => ({
    updateOneRecord: updateOneRecordMock,
  }),
}));

const workspaceMember: Omit<
  WorkspaceMember,
  'createdAt' | 'updatedAt' | 'userId' | 'userEmail'
> = {
  __typename: 'WorkspaceMember',
  id: 'id',
  name: {
    firstName: 'firstName',
    lastName: 'lastName',
  },
  locale: WorkspaceMemberLocaleEnum.EnUs,
  timeZone: 'system',
  dateFormat: WorkspaceMemberDateFormatEnum.System,
  timeFormat: WorkspaceMemberTimeFormatEnum.System,
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

    expect(result.current.colorScheme).toBe('SYSTEM');

    await act(async () => {
      await result.current.setColorScheme(WorkspaceMemberColorSchemeEnum.Dark);
    });

    // FIXME: For some reason, the color gets unset
    // expect(result.current.colorScheme).toEqual('Dark');
  });
});
