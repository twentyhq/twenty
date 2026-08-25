import { ChatReferenceChipDisplay } from '@/ai/components/ChatReferenceChipDisplay';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import { useIcons } from 'twenty-ui/icon';
import { useTheme } from 'twenty-ui/theme-constants';
import { PermissionFlagType } from '~/generated-metadata/graphql';

const PROPOSED_FIELD_METADATA_ICON = 'IconTag';

type FieldMetadataChipProps = {
  displayName: string;
  objectMetadataItem?: EnrichedObjectMetadataItem | null;
  fieldMetadataItem?: FieldMetadataItem;
};

export const FieldMetadataChip = ({
  displayName,
  objectMetadataItem,
  fieldMetadataItem,
}: FieldMetadataChipProps) => {
  const theme = useTheme();
  const { getIcon } = useIcons();

  const hasDataModelPermission = useHasPermissionFlag(
    PermissionFlagType.DATA_MODEL,
  );

  const Icon = getIcon(fieldMetadataItem?.icon ?? PROPOSED_FIELD_METADATA_ICON);

  return (
    <ChatReferenceChipDisplay
      displayName={displayName}
      to={
        isDefined(objectMetadataItem) &&
        isDefined(fieldMetadataItem) &&
        hasDataModelPermission
          ? getSettingsPath(SettingsPath.ObjectFieldEdit, {
              objectNamePlural: objectMetadataItem.namePlural,
              fieldName: fieldMetadataItem.name,
            })
          : undefined
      }
      leftComponent={
        <Icon size={theme.icon.size.sm} stroke={theme.icon.stroke.sm} />
      }
    />
  );
};
