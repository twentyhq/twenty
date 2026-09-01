import { ChatReferenceChipDisplay } from '@/ai/components/ChatReferenceChipDisplay';
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

  return (
    <ChatReferenceChipDisplay
      displayName={displayName}
      to={
        isDefined(objectMetadataItem) && hasDataModelPermission
          ? getSettingsPath(SettingsPath.ObjectDetail, {
              objectNamePlural: objectMetadataItem.namePlural,
            })
          : undefined
      }
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
