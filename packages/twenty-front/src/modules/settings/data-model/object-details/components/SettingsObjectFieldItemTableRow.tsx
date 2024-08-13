import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useMemo } from 'react';
import { useIcons } from 'twenty-ui';

import { useGetRelationMetadata } from '@/object-metadata/hooks/useGetRelationMetadata';
import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { getObjectSlug } from '@/object-metadata/utils/getObjectSlug';
import { isFieldTypeSupportedInSettings } from '@/settings/data-model/utils/isFieldTypeSupportedInSettings';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableRow } from '@/ui/layout/table/components/TableRow';

import { RELATION_TYPES } from '../../constants/RelationTypes';

import { LABEL_IDENTIFIER_FIELD_METADATA_TYPES } from '@/object-metadata/constants/LabelIdentifierFieldMetadataTypes';
import { useFieldMetadataItem } from '@/object-metadata/hooks/useFieldMetadataItem';
import { useUpdateOneObjectMetadataItem } from '@/object-metadata/hooks/useUpdateOneObjectMetadataItem';
import { getFieldSlug } from '@/object-metadata/utils/getFieldSlug';
import { isLabelIdentifierField } from '@/object-metadata/utils/isLabelIdentifierField';
import { SettingsObjectFieldActiveActionDropdown } from '@/settings/data-model/object-details/components/SettingsObjectFieldActiveActionDropdown';
import { SettingsObjectFieldInactiveActionDropdown } from '@/settings/data-model/object-details/components/SettingsObjectFieldDisabledActionDropdown';
import { useNavigate } from 'react-router-dom';
import { RelationMetadataType } from '~/generated-metadata/graphql';
import { SettingsObjectDetailTableItem } from '~/pages/settings/data-model/types/SettingsObjectDetailTableItem';
import { SettingsObjectFieldDataType } from './SettingsObjectFieldDataType';

type SettingsObjectFieldItemTableRowProps = {
  settingsObjectDetailTableItem: SettingsObjectDetailTableItem;
  status: 'active' | 'disabled';
};

export const StyledObjectFieldTableRow = styled(TableRow)`
  grid-template-columns: 180px 148px 148px 36px;
`;

const StyledNameTableCell = styled(TableCell)`
  color: ${({ theme }) => theme.font.color.primary};
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledIconTableCell = styled(TableCell)`
  justify-content: center;
  padding-right: ${({ theme }) => theme.spacing(1)};
`;

export const SettingsObjectFieldItemTableRow = ({
  settingsObjectDetailTableItem,
  status,
}: SettingsObjectFieldItemTableRowProps) => {
  const navigate = useNavigate();

  const { fieldMetadataItem, identifier, objectMetadataItem } =
    settingsObjectDetailTableItem;

  const theme = useTheme();
  const { getIcon } = useIcons();
  const Icon = getIcon(fieldMetadataItem.icon);

  const getRelationMetadata = useGetRelationMetadata();

  const { relationObjectMetadataItem, relationType } =
    useMemo(
      () => getRelationMetadata({ fieldMetadataItem }),
      [fieldMetadataItem, getRelationMetadata],
    ) ?? {};

  const fieldType = fieldMetadataItem.type;
  const isFieldTypeSupported = isFieldTypeSupportedInSettings(fieldType);

  const RelationIcon = relationType
    ? RELATION_TYPES[relationType].Icon
    : undefined;

  const isLabelIdentifier = isLabelIdentifierField({
    fieldMetadataItem,
    objectMetadataItem,
  });

  const canBeSetAsLabelIdentifier =
    objectMetadataItem.isCustom &&
    !isLabelIdentifier &&
    LABEL_IDENTIFIER_FIELD_METADATA_TYPES.includes(fieldMetadataItem.type);

  const linkToNavigate = `./${getFieldSlug(fieldMetadataItem)}`;

  const variant = objectMetadataItem.isCustom ? 'identifier' : 'field-type';

  const isRemoteObjectField = objectMetadataItem.isRemote;

  const {
    activateMetadataField,
    deactivateMetadataField,
    deleteMetadataField,
  } = useFieldMetadataItem();

  const handleDisableField = (activeFieldMetadatItem: FieldMetadataItem) => {
    deactivateMetadataField(activeFieldMetadatItem);
  };

  const { updateOneObjectMetadataItem } = useUpdateOneObjectMetadataItem();

  const handleSetLabelIdentifierField = (
    activeFieldMetadatItem: FieldMetadataItem,
  ) =>
    updateOneObjectMetadataItem({
      idToUpdate: objectMetadataItem.id,
      updatePayload: {
        labelIdentifierFieldMetadataId: activeFieldMetadatItem.id,
      },
    });

  if (!isFieldTypeSupported) return null;

  return (
    <StyledObjectFieldTableRow to={linkToNavigate}>
      <StyledNameTableCell>
        {!!Icon && (
          <Icon size={theme.icon.size.md} stroke={theme.icon.stroke.sm} />
        )}
        {fieldMetadataItem.label}
      </StyledNameTableCell>
      <TableCell>
        {variant === 'field-type' &&
          (isRemoteObjectField
            ? 'Remote'
            : fieldMetadataItem.isCustom
              ? 'Custom'
              : 'Standard')}
        {variant === 'identifier' &&
          !!identifier &&
          (identifier === 'label' ? 'Record text' : 'Record image')}
      </TableCell>
      <TableCell>
        <SettingsObjectFieldDataType
          Icon={RelationIcon}
          label={
            relationType === RelationMetadataType.ManyToOne ||
            relationType === RelationMetadataType.OneToOne
              ? relationObjectMetadataItem?.labelSingular
              : relationObjectMetadataItem?.labelPlural
          }
          to={
            relationObjectMetadataItem?.namePlural &&
            !relationObjectMetadataItem.isSystem
              ? `/settings/objects/${getObjectSlug(relationObjectMetadataItem)}`
              : undefined
          }
          value={fieldType}
        />
      </TableCell>
      <StyledIconTableCell>
        {status === 'active' ? (
          <SettingsObjectFieldActiveActionDropdown
            isCustomField={fieldMetadataItem.isCustom === true}
            scopeKey={fieldMetadataItem.id}
            onEdit={() => navigate(linkToNavigate)}
            onSetAsLabelIdentifier={
              canBeSetAsLabelIdentifier
                ? () => handleSetLabelIdentifierField(fieldMetadataItem)
                : undefined
            }
            onDeactivate={
              isLabelIdentifier
                ? undefined
                : () => handleDisableField(fieldMetadataItem)
            }
          />
        ) : (
          <SettingsObjectFieldInactiveActionDropdown
            isCustomField={fieldMetadataItem.isCustom === true}
            scopeKey={fieldMetadataItem.id}
            onActivate={() => activateMetadataField(fieldMetadataItem)}
            onDelete={() => deleteMetadataField(fieldMetadataItem)}
          />
        )}
      </StyledIconTableCell>
    </StyledObjectFieldTableRow>
  );
};
