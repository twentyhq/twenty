import { ChatReferenceChipDisplay } from '@/ai/components/ChatReferenceChipDisplay';
import { useChatReferenceTarget } from '@/ai/hooks/useChatReferenceTarget';
import { ObjectMetadataIcon } from '@/object-metadata/components/ObjectMetadataIcon';
import { objectMetadataItemFamilySelector } from '@/object-metadata/states/objectMetadataItemFamilySelector';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import { useTheme } from 'twenty-ui/theme-constants';
import { PermissionFlagType } from '~/generated-metadata/graphql';

const PROPOSED_OBJECT_METADATA_ICON = 'IconListNumbers';

type ObjectMetadataLinkProps = {
  objectNameSingular: string;
  displayName: string;
};

export const ObjectMetadataLink = ({
  objectNameSingular,
  displayName,
}: ObjectMetadataLinkProps) => {
  const theme = useTheme();
  const hasDataModelPermission = useHasPermissionFlag(
    PermissionFlagType.DATA_MODEL,
  );

  const objectMetadataItem = useAtomFamilySelectorValue(
    objectMetadataItemFamilySelector,
    {
      objectName: objectNameSingular,
      objectNameType: 'singular',
    },
  );

  const path =
    isDefined(objectMetadataItem) && hasDataModelPermission
      ? getSettingsPath(SettingsPath.ObjectDetail, {
          objectNamePlural: objectMetadataItem.namePlural,
        })
      : undefined;

  const { to, onClick } = useChatReferenceTarget(path);

  return (
    <ChatReferenceChipDisplay
      displayName={displayName}
      to={to}
      onClick={onClick}
      leftComponent={
        <ObjectMetadataIcon
          objectMetadataItem={
            objectMetadataItem ?? {
              icon: PROPOSED_OBJECT_METADATA_ICON,
              nameSingular: objectNameSingular,
              color: null,
              isSystem: false,
            }
          }
          size={theme.icon.size.sm}
          stroke={theme.icon.stroke.sm}
        />
      }
    />
  );
};
