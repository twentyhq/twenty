import { ChatReferenceChipDisplay } from '@/ai/components/ChatReferenceChipDisplay';
import { type ChatReferenceIdentity } from '@/ai/types/ChatReferenceIdentity';
import { fieldMetadataItemByIdSelector } from '@/object-metadata/states/fieldMetadataItemByIdSelector';
import { objectMetadataItemFamilySelector } from '@/object-metadata/states/objectMetadataItemFamilySelector';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import { useIcons } from 'twenty-ui/icon';
import { useTheme } from 'twenty-ui/theme-constants';
import { PermissionFlagType } from '~/generated-metadata/graphql';

const UNRESOLVED_FIELD_METADATA_ICON = 'IconTag';

type FieldMetadataLinkProps = {
  reference: Extract<
    ChatReferenceIdentity,
    { kind: 'field' | 'legacyFieldById' }
  > & { displayName: string };
};

export const FieldMetadataLink = ({ reference }: FieldMetadataLinkProps) => {
  const { displayName } = reference;
  const theme = useTheme();
  const { getIcon } = useIcons();

  const {
    foundFieldMetadataItem: fieldMetadataItemFoundById,
    foundObjectMetadataItem: objectMetadataItemFoundById,
  } = useAtomFamilySelectorValue(fieldMetadataItemByIdSelector, {
    fieldMetadataItemId:
      reference.kind === 'legacyFieldById' ? reference.fieldMetadataItemId : '',
  });

  const objectMetadataItemFoundByName = useAtomFamilySelectorValue(
    objectMetadataItemFamilySelector,
    {
      objectName:
        reference.kind === 'field' ? reference.objectNameSingular : '',
      objectNameType: 'singular',
    },
  );

  const hasDataModelPermission = useHasPermissionFlag(
    PermissionFlagType.DATA_MODEL,
  );

  const objectMetadataItem =
    reference.kind === 'field'
      ? objectMetadataItemFoundByName
      : objectMetadataItemFoundById;

  const fieldMetadataItem =
    reference.kind === 'field'
      ? objectMetadataItemFoundByName?.fields.find(
          (field) => field.name === reference.fieldName,
        )
      : fieldMetadataItemFoundById;

  if (reference.kind === 'legacyFieldById' && !isDefined(fieldMetadataItem)) {
    return <span>{displayName}</span>;
  }

  const Icon = getIcon(
    fieldMetadataItem?.icon ?? UNRESOLVED_FIELD_METADATA_ICON,
  );

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
