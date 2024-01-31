import { ReactNode, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';

import { useGetRelationMetadata } from '@/object-metadata/hooks/useGetRelationMetadata';
import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { getObjectSlug } from '@/object-metadata/utils/getObjectSlug';
import { FieldIdentifierType } from '@/settings/data-model/types/FieldIdentifierType';
import { useIcons } from '@/ui/display/icon/hooks/useIcons';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { Nullable } from '~/types/Nullable';

import { relationTypes } from '../../constants/relationTypes';
import { settingsFieldMetadataTypes } from '../../constants/settingsFieldMetadataTypes';

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

  // TODO: parse with zod and merge types with FieldType (create a subset of FieldType for example)
  const fieldDataTypeIsSupported =
    fieldMetadataItem.type in settingsFieldMetadataTypes;

  const getRelationMetadata = useGetRelationMetadata();

  const { relationObjectMetadataItem, relationType } =
    useMemo(
      () => getRelationMetadata({ fieldMetadataItem }),
      [fieldMetadataItem, getRelationMetadata],
    ) ?? {};

  if (!fieldDataTypeIsSupported) return null;

  const RelationIcon = relationType
    ? relationTypes[relationType].Icon
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
          value={fieldMetadataItem.type}
        />
      </TableCell>
      <StyledIconTableCell>{ActionIcon}</StyledIconTableCell>
    </StyledObjectFieldTableRow>
  );
};
