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
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useContext, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { FieldMetadataType, SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import { IconChevronRight, useIcons } from 'twenty-ui/display';
import { UndecoratedLink } from 'twenty-ui/navigation';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

type SettingsObjectRelationItemTableRowProps = {
  fieldMetadataItem: FieldMetadataItem;
  objectMetadataItem: ObjectMetadataItem;
};

export const OBJECT_RELATION_TABLE_ROW_GRID_TEMPLATE_COLUMNS =
  'minmax(0, 1fr) 148px 148px 36px';

const StyledNameContainer = styled.div`
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 0;
  gap: ${themeCssVariables.spacing[1]};
`;

const StyledNameLabel = styled.div`
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
`;

const StyledInactiveLabel = styled.span`
  color: ${themeCssVariables.font.color.extraLight};
  font-size: ${themeCssVariables.font.size.sm};
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  flex: 0 999 auto;
  min-width: 48px;

  &::before {
    content: '·';
    margin-right: ${themeCssVariables.spacing[1]};
  }
`;

const StyledIconChevronRightContainer = styled.span`
  align-items: center;
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
`;

const StyledRelationType = styled.div`
  align-items: center;
  display: flex;
  font-size: ${themeCssVariables.font.size.sm};
  gap: ${themeCssVariables.spacing[1]};
`;

const StyledLinkContainer = styled.div`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  > a {
    color: ${themeCssVariables.font.color.primary};
    text-decoration: underline;
    text-decoration-color: ${themeCssVariables.border.color.strong};
    text-underline-offset: 2px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;

    &:hover {
      color: ${themeCssVariables.color.blue};
      text-decoration-color: ${themeCssVariables.color.blue};
    }
  }
`;

export const SettingsObjectRelationItemTableRow = ({
  fieldMetadataItem,
  objectMetadataItem,
}: SettingsObjectRelationItemTableRowProps) => {
  const { theme } = useContext(ThemeContext);
  const { t } = useLingui();
  const navigate = useNavigateSettings();
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

  // oxlint-disable-next-line twenty/no-navigate-prefer-link
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
    isRelatedObjectLinkable && isDefined(relationObjectMetadataItem)
      ? relationObjectMetadataItem.labelPlural
      : fieldMetadataItem.label;

  return (
    <TableRow
      gridTemplateColumns={OBJECT_RELATION_TABLE_ROW_GRID_TEMPLATE_COLUMNS}
      to={linkToNavigate}
    >
      <TableCell
        color={themeCssVariables.font.color.primary}
        gap={themeCssVariables.spacing[2]}
      >
        {isDefined(Icon) && (
          <Icon
            style={{
              minWidth: theme.icon.size.md,
            }}
            size={theme.icon.size.md}
            stroke={theme.icon.stroke.sm}
          />
        )}
        <StyledNameContainer>
          {isRelatedObjectLinkable ? (
            <StyledLinkContainer>
              <Link
                to={getSettingsPath(SettingsPath.ObjectDetail, {
                  objectNamePlural: relationObjectMetadataItem.namePlural,
                })}
                onClick={(event) => event.stopPropagation()}
                title={targetObjectLabel}
              >
                {targetObjectLabel}
              </Link>
            </StyledLinkContainer>
          ) : (
            <StyledNameLabel title={targetObjectLabel}>
              {targetObjectLabel}
            </StyledNameLabel>
          )}
          {!fieldMetadataItem.isActive && (
            <StyledInactiveLabel>{t`Deactivated`}</StyledInactiveLabel>
          )}
        </StyledNameContainer>
      </TableCell>

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

      <TableCell
        align="center"
        padding={`0 ${themeCssVariables.spacing[1]} 0 ${themeCssVariables.spacing[2]}`}
      >
        {fieldMetadataItem.isActive ? (
          <UndecoratedLink to={linkToNavigate}>
            <StyledIconChevronRightContainer>
              <IconChevronRight
                size={theme.icon.size.md}
                stroke={theme.icon.stroke.sm}
              />
            </StyledIconChevronRightContainer>
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
      </TableCell>
    </TableRow>
  );
};
