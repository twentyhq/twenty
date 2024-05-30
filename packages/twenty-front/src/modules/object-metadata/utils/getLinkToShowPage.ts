import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { getBasePathToShowPage } from '@/object-metadata/utils/getBasePathToShowPage';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';

export const getLinkToShowPage = (
  objectNameSingular: string,
  record: ObjectRecord,
) => {
  const basePathToShowPage = getBasePathToShowPage({
    objectNameSingular,
  });

  const isWorkspaceMemberObjectMetadata =
    objectNameSingular === CoreObjectNameSingular.WorkspaceMember;

  const linkToShowPage =
    isWorkspaceMemberObjectMetadata || !record.id
      ? ''
      : `${basePathToShowPage}${record.id}`;

  return linkToShowPage;
};
