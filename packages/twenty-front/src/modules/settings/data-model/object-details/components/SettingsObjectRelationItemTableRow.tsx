import { useDeleteOneFieldMetadataItem } from '@/object-metadata/hooks/useDeleteOneFieldMetadataItem';
import { useFieldMetadataItem } from '@/object-metadata/hooks/useFieldMetadataItem';
import { useGetRelationMetadata } from '@/object-metadata/hooks/useGetRelationMetadata';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { isObjectMetadataReadOnly } from '@/object-record/read-only/utils/isObjectMetadataReadOnly';
import { SettingsItemTypeTag } from '@/settings/components/SettingsItemTypeTag';
import { RELATION_TYPES } from '@/settings/data-model/constants/RelationTypes';
import { SettingsObjectFieldInactiveActionDropdown } from '@/settings/data-model/object-details/components/SettingsObjectFieldDisabledActionDropdown';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { FieldMetadataType, SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import { IconChevronRight, useIcons } from 'twenty-ui/display';
import { UndecoratedLink } from 'twenty-ui/navigation';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

type SettingsObjectRelationItemTableRowProps = {
  fieldMetadataItem: FieldMetadataItem;
  objectMetadataItem: ObjectMetadataItem;
};

export const StyledObjectRelationTableRow = styled(TableRow)`
  grid-template-columns: 180px 100px 148px 36px;
`;

const StyledNameTableCell = styled(TableCell)`
  color: ${({ theme }) => theme.font.color.primary};
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledNameContainer = styled.div`
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 0;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const StyledNameLabel = styled.div`
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
`;

const StyledInactiveLabel = styled.span`
  color: ${({ theme }) => theme.font.color.extraLight};
  font-size: ${({ theme }) => theme.font.size.sm};
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  flex: 0 999 auto;
  min-width: 48px;

  &::before {
    content: '·';
    margin-right: ${({ theme }) => theme.spacing(1)};
  }
`;

const StyledIconTableCell = styled(TableCell)`
  justify-content: center;
  padding-right: ${({ theme }) => theme.spacing(1)};
`;

const StyledIconChevronRight = styled(IconChevronRight)`
  color: ${({ theme }) => theme.font.color.tertiary};
`;

const StyledRelationType = styled.div`
  align-items: center;
  display: flex;
  font-size: ${({ theme }) => theme.font.size.sm};
  gap: ${({ theme }) => theme.spacing(1)};
`;

const StyledLink = styled(Link)`
  color: ${({ theme }) => theme.font.color.primary};
  text-decoration: underline;
  text-decoration-color: ${({ theme }) => theme.border.color.strong};
  text-underline-offset: 2px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  &:hover {
    color: ${({ theme }) => theme.color.blue};
    text-decoration-color: ${({ theme }) => theme.color.blue};
  }
`;

export const SettingsObjectRelationItemTableRow = ({
  fieldMetadataItem,
  objectMetadataItem,
}: SettingsObjectRelationItemTableRowProps) => {
  const { t } = useLingui();
  const navigate = useNavigateSettings();
  const theme = useTheme();
  const { getIcon } = useIcons();

  const Icon = getIcon(fieldMetadataItem.icon);

  const getRelationMetadata = useGetRelationMetadata();
  const { relationObjectMetadataItem, relationType } =
    useMemo(
      () => getRelationMetadata({ fieldMetadataItem }),
      [fieldMetadataItem, getRelationMetadata],
    ) ?? {};

  const readonly = isObjectMetadataReadOnly({
    objectMetadataItem,
  });

  const { activateMetadataField } = useFieldMetadataItem();
  const { deleteOneFieldMetadataItem } = useDeleteOneFieldMetadataItem();

  const linkToNavigate = getSettingsPath(SettingsPath.ObjectFieldEdit, {
    objectNamePlural: objectMetadataItem.namePlural,
    fieldName: fieldMetadataItem.name,
  });

  // eslint-disable-next-line @nx/workspace-no-navigate-prefer-link
  const navigateToFieldEdit = () =>
    navigate(SettingsPath.ObjectFieldEdit, {
      objectNamePlural: objectMetadataItem.namePlural,
      fieldName: fieldMetadataItem.name,
    });

  const isRelatedObjectLinkable =
    isDefined(relationObjectMetadataItem?.namePlural) &&
    !relationObjectMetadataItem.isSystem;

  const morphRelationCount = fieldMetadataItem.morphRelations?.length;

  const relationTypeLabel = (() => {
    if (fieldMetadataItem.type === FieldMetadataType.MORPH_RELATION) {
      return t`${morphRelationCount} Objects`;
    }
    if (isDefined(relationType) === true) {
      return RELATION_TYPES[relationType].label;
    }
    return '';
  })();

  const RelationIcon = relationType
    ? RELATION_TYPES[relationType].Icon
    : undefined;

  const targetObjectLabel =
    isRelatedObjectLinkable && relationObjectMetadataItem
      ? relationObjectMetadataItem.labelPlural
      : fieldMetadataItem.label;

  return (
    // eslint-disable-next-line @nx/workspace-no-navigate-prefer-link
    <StyledObjectRelationTableRow onClick={navigateToFieldEdit}>
      <StyledNameTableCell>
        {!!Icon && (
          <Icon
            style={{ minWidth: theme.icon.size.md }}
            size={theme.icon.size.md}
            stroke={theme.icon.stroke.sm}
          />
        )}
        <StyledNameContainer>
          {isRelatedObjectLinkable ? (
            <StyledLink
              to={getSettingsPath(SettingsPath.ObjectDetail, {
                objectNamePlural: relationObjectMetadataItem.namePlural,
              })}
              onClick={(event) => event.stopPropagation()}
              title={targetObjectLabel}
            >
              {targetObjectLabel}
            </StyledLink>
          ) : (
            <StyledNameLabel title={targetObjectLabel}>
              {targetObjectLabel}
            </StyledNameLabel>
          )}
          {!fieldMetadataItem.isActive && (
            <StyledInactiveLabel>{t`Deactivated`}</StyledInactiveLabel>
          )}
        </StyledNameContainer>
      </StyledNameTableCell>

      <TableCell>
        <SettingsItemTypeTag
          item={{
            isCustom: fieldMetadataItem.isCustom ?? undefined,
            isRemote: objectMetadataItem.isRemote,
            applicationId: fieldMetadataItem.applicationId,
          }}
        />
      </TableCell>

      <TableCell>
        <StyledRelationType>
          {RelationIcon && (
            <RelationIcon
              size={theme.icon.size.sm}
              stroke={theme.icon.stroke.sm}
            />
          )}
          {relationTypeLabel}
        </StyledRelationType>
      </TableCell>

      <StyledIconTableCell>
        {fieldMetadataItem.isActive ? (
          <UndecoratedLink to={linkToNavigate}>
            <StyledIconChevronRight
              size={theme.icon.size.md}
              stroke={theme.icon.stroke.sm}
            />
          </UndecoratedLink>
        ) : (
          <SettingsObjectFieldInactiveActionDropdown
            isCustomField={fieldMetadataItem.isCustom === true}
            readonly={readonly}
            fieldMetadataItemId={fieldMetadataItem.id}
            onEdit={navigateToFieldEdit}
            onActivate={() =>
              activateMetadataField(fieldMetadataItem.id, objectMetadataItem.id)
            }
            onDelete={() =>
              deleteOneFieldMetadataItem({
                idToDelete: fieldMetadataItem.id,
                objectMetadataId: objectMetadataItem.id,
              })
            }
          />
        )}
      </StyledIconTableCell>
    </StyledObjectRelationTableRow>
  );
};
