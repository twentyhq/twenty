import { AppPath, StandardObjectNameSingular } from 'twenty-shared/types';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { isNonEmptyString } from '@sniptt/guards';
import { getAppPath } from 'twenty-shared/utils';
import { getBasePathToShowPage } from '@/object-metadata/utils/getBasePathToShowPage';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';

export const getLinkToShowPage = ({
  objectNameSingular,
  objectUniversalIdentifier,
  record,
}: {
  objectNameSingular: string;
  objectUniversalIdentifier?: string;
  record: Partial<ObjectRecord>;
}) => {
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
    objectUniversalIdentifier ===
      STANDARD_OBJECTS.agentChatThread.universalIdentifier &&
    isNonEmptyString(record.id)
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
    isWorkspaceMemberObjectMetadata || !isNonEmptyString(record.id)
      ? ''
      : `${basePathToShowPage}${record.id}`;

  return linkToShowPage;
};
