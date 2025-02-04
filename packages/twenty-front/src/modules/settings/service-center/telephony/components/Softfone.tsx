import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { useGetUserSoftfone } from '@/settings/service-center/telephony/hooks/useGetUserSoftfone';
import { WorkspaceMember } from '@/workspace-member/types/WorkspaceMember';
import InnerHTML from 'dangerously-set-html-content';
import { useRecoilValue } from 'recoil';

export const Softfone = () => {
  const currentWorkspaceMember = useRecoilValue(currentWorkspaceMemberState);

  const { records: workspaceMembers } = useFindManyRecords<WorkspaceMember>({
    objectNameSingular: CoreObjectNameSingular.WorkspaceMember,
  });

  const workspaceMember = workspaceMembers.find(
    (member) => member.id === currentWorkspaceMember?.id,
  );

  const { telephonyExtension, loading: loadingSoftfone } = useGetUserSoftfone({
    extNum: workspaceMember?.extensionNumber || '',
  });

  return (
    <>
      {!loadingSoftfone && telephonyExtension && (
        <InnerHTML
          allowRerender
          html={telephonyExtension.codigo_incorporacao}
        />
      )}
    </>
  );
};
