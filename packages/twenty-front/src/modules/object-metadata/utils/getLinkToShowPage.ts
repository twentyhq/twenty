import { AppPath, StandardObjectNameSingular } from 'twenty-shared/types';
import { getAppPath } from 'twenty-shared/utils';
import { getBasePathToShowPage } from '@/object-metadata/utils/getBasePathToShowPage';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';

export const getLinkToShowPage = (
  objectNameSingular: string,
  record: Partial<ObjectRecord>,
) => {
  const basePathToShowPage = getBasePathToShowPage({
    objectNameSingular,
  });

  const isWorkspaceMemberObjectMetadata =
    objectNameSingular === StandardObjectNameSingular.WorkspaceMember;

  if (objectNameSingular === StandardObjectNameSingular.NoteTarget) {
    return (
      getBasePathToShowPage({
        objectNameSingular: StandardObjectNameSingular.Note,
      }) + record.note?.id
    );
  }

  if (
    objectNameSingular === StandardObjectNameSingular.AgentChatThread &&
    record.id
  ) {
    return getAppPath(AppPath.AiChat, { threadId: record.id });
  }

  if (objectNameSingular === StandardObjectNameSingular.TaskTarget) {
    return (
      getBasePathToShowPage({
        objectNameSingular: StandardObjectNameSingular.Task,
      }) + record.task?.id
    );
  }

  const linkToShowPage =
    isWorkspaceMemberObjectMetadata || !record.id
      ? ''
      : `${basePathToShowPage}${record.id}`;

  return linkToShowPage;
};
