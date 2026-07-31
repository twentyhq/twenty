import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { objectMetadataItemFamilySelector } from '@/object-metadata/states/objectMetadataItemFamilySelector';
import { DEFAULT_OPEN_RECORD_IN_PREFERENCE } from '@/object-record/record-index/constants/DefaultOpenRecordInPreference';
import { resolveOpenRecordIn } from '@/object-record/record-index/utils/resolveOpenRecordIn';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { ObjectOpenRecordIn } from 'twenty-shared/types';
import { useIsMobile } from 'twenty-ui/utilities';

export const useResolveOpenRecordIn = (objectNameSingular: string) => {
  // Non-throwing on purpose: record chips render in a lot of places, and a
  // chip is not the right component to crash when metadata is still loading.
  const objectMetadataItem = useAtomFamilySelectorValue(
    objectMetadataItemFamilySelector,
    {
      objectName: objectNameSingular,
      objectNameType: 'singular',
    },
  );

  const currentWorkspaceMember = useAtomStateValue(currentWorkspaceMemberState);

  const isMobile = useIsMobile();

  return resolveOpenRecordIn({
    objectOpenRecordIn:
      objectMetadataItem?.openRecordIn ?? ObjectOpenRecordIn.USER_CHOICE,
    openRecordInPreference:
      currentWorkspaceMember?.openRecordIn ?? DEFAULT_OPEN_RECORD_IN_PREFERENCE,
    canDisplaySidePanel: !isMobile,
  });
};
