import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { getAvatarType } from '@/object-metadata/utils/getAvatarType';
import { getBasePathToShowPage } from '@/object-metadata/utils/getBasePathToShowPage';
import { type ObjectRecordIdentifier } from '@/object-record/types/ObjectRecordIdentifier';
import { isDefined } from 'twenty-shared/utils';

type RecordIdentifierDTO = {
  id: string;
  labelIdentifier: string;
  imageIdentifier?: string | null;
};

export const recordIdentifierToObjectRecordIdentifier = ({
  recordIdentifier,
  objectMetadataItem,
}: {
  recordIdentifier: RecordIdentifierDTO;
  objectMetadataItem: ObjectMetadataItem;
}): ObjectRecordIdentifier => {
  const avatarType = getAvatarType(objectMetadataItem.nameSingular);

  const basePathToShowPage = getBasePathToShowPage({
    objectNameSingular: objectMetadataItem.nameSingular,
  });

  const isWorkspaceMemberObjectMetadata =
    objectMetadataItem.nameSingular === CoreObjectNameSingular.WorkspaceMember;

  let linkToShowPage = '';

  if (
    objectMetadataItem.nameSingular === CoreObjectNameSingular.NoteTarget ||
    objectMetadataItem.nameSingular === CoreObjectNameSingular.TaskTarget
  ) {
    linkToShowPage = '';
  } else if (
    !isWorkspaceMemberObjectMetadata &&
    isDefined(recordIdentifier.id)
  ) {
    linkToShowPage = `${basePathToShowPage}${recordIdentifier.id}`;
  }

  return {
    id: recordIdentifier.id,
    name: recordIdentifier.labelIdentifier,
    avatarUrl: recordIdentifier.imageIdentifier ?? undefined,
    avatarType,
    linkToShowPage,
  };
};
