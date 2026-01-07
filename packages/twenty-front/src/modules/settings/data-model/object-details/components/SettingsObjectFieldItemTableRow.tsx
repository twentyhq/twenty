import { useDeleteOneFieldMetadataItem } from '@/object-metadata/hooks/useDeleteOneFieldMetadataItem';
import { useFieldMetadataItem } from '@/object-metadata/hooks/useFieldMetadataItem';
import { useGetRelationMetadata } from '@/object-metadata/hooks/useGetRelationMetadata';
import { isLabelIdentifierField } from '@/object-metadata/utils/isLabelIdentifierField';
import { isObjectMetadataReadOnly } from '@/object-record/read-only/utils/isObjectMetadataReadOnly';
import { SettingsItemTypeTag } from '@/settings/components/SettingsItemTypeTag';
import { RELATION_TYPES } from '@/settings/data-model/constants/RelationTypes';
import { SettingsObjectFieldInactiveActionDropdown } from '@/settings/data-model/object-details/components/SettingsObjectFieldDisabledActionDropdown';
import { settingsObjectFieldsFamilyState } from '@/settings/data-model/object-details/states/settingsObjectFieldsFamilyState';
import { isFieldTypeSupportedInSettings } from '@/settings/data-model/utils/isFieldTypeSupportedInSettings';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { useMemo } from 'react';
import { useRecoilState } from 'recoil';
import { FieldMetadataType, SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import {
  IconChevronRight,
  IconMinus,
  IconPlus,
  useIcons,
} from 'twenty-ui/display';
import { LightIconButton } from 'twenty-ui/input';
import { UndecoratedLink } from 'twenty-ui/navigation';
import { RelationType } from '~/generated-metadata/graphql';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';
import { type SettingsObjectDetailTableItem } from '~/pages/settings/data-model/types/SettingsObjectDetailTableItem';
import { SettingsObjectFieldDataType } from './SettingsObjectFieldDataType';

type SettingsObjectFieldItemTableRowProps = {
  settingsObjectDetailTableItem: SettingsObjectDetailTableItem;
  status: 'active' | 'disabled';
  mode: 'view' | 'new-field';
};

export const StyledObjectFieldTableRow = styled(TableRow)`
  grid-auto-columns: 180px 148px 148px 36px;
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

export const SettingsObjectFieldItemTableRow = ({
  settingsObjectDetailTableItem,
  mode,
  status,
}: SettingsObjectFieldItemTableRowProps) => {
  const { t } = useLingui();
  const { fieldMetadataItem, objectMetadataItem } =
    settingsObjectDetailTableItem;

  const readonly = isObjectMetadataReadOnly({
    objectMetadataItem,
  });

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
  const fieldType = fieldMetadataItem.type;
  const isFieldTypeSupported = isFieldTypeSupportedInSettings(fieldType);

  const RelationIcon = relationType
    ? RELATION_TYPES[relationType].Icon
    : undefined;

  const isLabelIdentifier = isLabelIdentifierField({
    fieldMetadataItem,
    objectMetadataItem,
  });

  const canToggleField = !isLabelIdentifier;

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

  const { activateMetadataField } = useFieldMetadataItem();

  const { deleteOneFieldMetadataItem } = useDeleteOneFieldMetadataItem();

  const [, setActiveSettingsObjectFields] = useRecoilState(
    settingsObjectFieldsFamilyState({
      objectMetadataItemId: objectMetadataItem.id,
    }),
  );

  const handleToggleField = () => {
    setActiveSettingsObjectFields((previousFields) => {
      const newFields = isDefined(previousFields)
        ? previousFields?.map((field) =>
            field.id === fieldMetadataItem.id
              ? { ...field, isActive: !field.isActive }
              : field,
          )
        : null;

      return newFields;
    });
  };

  if (!isFieldTypeSupported) return null;

  const isRelatedObjectLinkable =
    isDefined(relationObjectMetadataItem?.namePlural) &&
    !relationObjectMetadataItem.isSystem;

  const morphRelationCount = fieldMetadataItem.morphRelations?.length;
  const morphRelationLabel =
    fieldMetadataItem.type === FieldMetadataType.MORPH_RELATION
      ? t`${morphRelationCount} Objects`
      : undefined;

  const label = morphRelationLabel
    ? morphRelationLabel
    : relationType === RelationType.MANY_TO_ONE
      ? relationObjectMetadataItem?.labelSingular
      : relationObjectMetadataItem?.labelPlural;

  return (
    <StyledObjectFieldTableRow
      onClick={mode === 'view' ? navigateToFieldEdit : undefined}
    >
      <UndecoratedLink to={linkToNavigate}>
        <StyledNameTableCell>
          {!!Icon && (
            <Icon
              style={{ minWidth: theme.icon.size.md }}
              size={theme.icon.size.md}
              stroke={theme.icon.stroke.sm}
            />
          )}
          <StyledNameContainer>
            <StyledNameLabel title={fieldMetadataItem.label}>
              {fieldMetadataItem.label}
            </StyledNameLabel>
            {!fieldMetadataItem.isActive && (
              <StyledInactiveLabel>{t`Deactivated`}</StyledInactiveLabel>
            )}
          </StyledNameContainer>
        </StyledNameTableCell>
      </UndecoratedLink>

      <TableCell>
        <SettingsItemTypeTag
          item={{
            applicationId: fieldMetadataItem.applicationId,
            isCustom: fieldMetadataItem.isCustom ?? undefined,
          }}
        />
      </TableCell>
      <TableCell>
        <SettingsObjectFieldDataType
          Icon={RelationIcon}
          label={label}
          labelDetail={
            fieldMetadataItem.settings?.type === 'percentage' ? '%' : undefined
          }
          to={
            isRelatedObjectLinkable
              ? getSettingsPath(SettingsPath.Objects, {
                  objectNamePlural: relationObjectMetadataItem.namePlural,
                })
              : undefined
          }
          value={fieldType}
          onClick={(e) => {
            if (isRelatedObjectLinkable) {
              e.stopPropagation();
            }
          }}
        />
      </TableCell>
      <StyledIconTableCell>
        {status === 'active' ? (
          mode === 'view' ? (
            <UndecoratedLink to={linkToNavigate}>
              <StyledIconChevronRight
                size={theme.icon.size.md}
                stroke={theme.icon.stroke.sm}
              />
            </UndecoratedLink>
          ) : (
            canToggleField && (
              <LightIconButton
                Icon={IconMinus}
                accent="tertiary"
                onClick={handleToggleField}
              />
            )
          )
        ) : mode === 'view' ? (
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
        ) : (
          <LightIconButton
            Icon={IconPlus}
            accent="tertiary"
            onClick={handleToggleField}
          />
        )}
      </StyledIconTableCell>
    </StyledObjectFieldTableRow>
  );
};
