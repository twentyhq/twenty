import { ReactNode, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';

import { useGetRelationMetadata } from '@/object-metadata/hooks/useGetRelationMetadata';
import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { getObjectSlug } from '@/object-metadata/utils/getObjectSlug';
import { FieldIdentifierType } from '@/settings/data-model/types/FieldIdentifierType';
import { isFieldTypeSupportedInSettings } from '@/settings/data-model/utils/isFieldTypeSupportedInSettings';
import { useIcons } from '@/ui/display/icon/hooks/useIcons';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { Nullable } from '~/types/Nullable';

import { RELATION_TYPES } from '../../constants/RelationTypes';

import { SettingsObjectFieldDataType } from './SettingsObjectFieldDataType';

type SettingsObjectFieldItemTableRowProps = {
  ActionIcon: ReactNode;
  fieldMetadataItem: FieldMetadataItem;
  identifierType?: Nullable<FieldIdentifierType>;
  variant?: 'field-type' | 'identifier';
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
  ActionIcon,
  fieldMetadataItem,
  identifierType,
  variant = 'field-type',
}: SettingsObjectFieldItemTableRowProps) => {
  const theme = useTheme();
  const { getIcon } = useIcons();
  const Icon = getIcon(fieldMetadataItem.icon);
  const navigate = useNavigate();

  const getRelationMetadata = useGetRelationMetadata();

  const { relationObjectMetadataItem, relationType } =
    useMemo(
      () => getRelationMetadata({ fieldMetadataItem }),
      [fieldMetadataItem, getRelationMetadata],
    ) ?? {};

  const fieldType = fieldMetadataItem.type;
  const isFieldTypeSupported = isFieldTypeSupportedInSettings(fieldType);

  if (!isFieldTypeSupported) return null;

  const RelationIcon = relationType
    ? RELATION_TYPES[relationType].Icon
    : undefined;

  return (
    <StyledObjectFieldTableRow>
      <StyledNameTableCell>
        {!!Icon && (
          <Icon size={theme.icon.size.md} stroke={theme.icon.stroke.sm} />
        )}
        {fieldMetadataItem.label}
      </StyledNameTableCell>
      <TableCell>
        {variant === 'field-type' &&
          (fieldMetadataItem.isCustom ? 'Custom' : 'Standard')}
        {variant === 'identifier' &&
          !!identifierType &&
          (identifierType === 'label' ? 'Record text' : 'Record image')}
      </TableCell>
      <TableCell>
        <SettingsObjectFieldDataType
          Icon={RelationIcon}
          label={relationObjectMetadataItem?.labelPlural}
          onClick={
            relationObjectMetadataItem?.namePlural &&
            !relationObjectMetadataItem.isSystem
              ? () =>
                  navigate(
                    `/settings/objects/${getObjectSlug(
                      relationObjectMetadataItem,
                    )}`,
                  )
              : undefined
          }
          value={fieldType}
        />
      </TableCell>
      <StyledIconTableCell>{ActionIcon}</StyledIconTableCell>
    </StyledObjectFieldTableRow>
  );
};
