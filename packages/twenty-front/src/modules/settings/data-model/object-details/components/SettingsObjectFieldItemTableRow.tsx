import { isDDLLockedState } from '@/client-config/states/isDDLLockedState';
import { useDeleteOneFieldMetadataItem } from '@/object-metadata/hooks/useDeleteOneFieldMetadataItem';
import { useFieldMetadataItem } from '@/object-metadata/hooks/useFieldMetadataItem';
import { useGetIsMetadataItemCustom } from '@/object-metadata/hooks/useGetIsMetadataItemCustom';
import { useGetRelationMetadata } from '@/object-metadata/hooks/useGetRelationMetadata';
import { isLabelIdentifierField } from '@/object-metadata/utils/isLabelIdentifierField';
import { isObjectMetadataReadOnly } from '@/object-record/read-only/utils/isObjectMetadataReadOnly';
import { SettingsItemTypeTag } from '@/settings/components/SettingsItemTypeTag';
import { SettingsNameCellSecondaryLabel } from '@/settings/components/SettingsNameCellSecondaryLabel';
import { RELATION_TYPES } from '@/settings/data-model/constants/RelationTypes';
import { SettingsObjectFieldInactiveActionDropdown } from '@/settings/data-model/object-details/components/SettingsObjectFieldDisabledActionDropdown';
import { settingsObjectFieldsFamilyState } from '@/settings/data-model/object-details/states/settingsObjectFieldsFamilyState';
import { isFieldTypeSupportedInSettings } from '@/settings/data-model/utils/isFieldTypeSupportedInSettings';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { TooltipDelay } from '@/ui/layout/tooltip/constants/TooltipDelay';
import { UndecoratedLink } from '@/ui/navigation/link/components/UndecoratedLink/UndecoratedLink';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomFamilyState } from '@/ui/utilities/state/jotai/hooks/useSetAtomFamilyState';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useMemo } from 'react';
import { FieldMetadataType, SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import { LightIconButton } from 'twenty-ui/components';
import {
  IconChevronRight,
  IconMinus,
  IconPlus,
  useIcons,
} from 'twenty-ui/icon';
import { Tooltip } from 'twenty-ui/primitives/surfaces';
import { useTheme, themeCssVariables } from 'twenty-ui/theme';
import { RelationType } from '~/generated-metadata/graphql';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';
import { type SettingsObjectDetailTableItem } from '~/pages/settings/data-model/types/SettingsObjectDetailTableItem';
import { SettingsObjectFieldDataType } from './SettingsObjectFieldDataType';

type SettingsObjectFieldItemTableRowProps = {
  settingsObjectDetailTableItem: SettingsObjectDetailTableItem;
  status: 'active' | 'disabled';
  mode: 'view' | 'new-field';
  isMostlyEmpty?: boolean;
};

export const OBJECT_FIELD_TABLE_ROW_GRID_TEMPLATE_COLUMNS =
  'minmax(0, 1fr) 148px 148px 36px';

const StyledNameContainer = styled.div`
  align-items: center;
  display: flex;
  flex: 1;
  gap: ${themeCssVariables.spacing[1]};
  min-width: 0;
`;

const StyledNameLabel = styled.div`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledIconChevronRightContainer = styled.span`
  align-items: center;
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
`;

export const SettingsObjectFieldItemTableRow = ({
  settingsObjectDetailTableItem,
  mode,
  status,
  isMostlyEmpty = false,
}: SettingsObjectFieldItemTableRowProps) => {
  const theme = useTheme();
  const { t } = useLingui();
  const { fieldMetadataItem, objectMetadataItem } =
    settingsObjectDetailTableItem;

  const getIsMetadataItemCustom = useGetIsMetadataItemCustom();

  const isDDLLocked = useAtomStateValue(isDDLLockedState);

  const readonly =
    isObjectMetadataReadOnly({
      objectMetadataItem,
    }) || isDDLLocked;

  const navigate = useNavigateSettings();

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

  const mostlyEmptyLabelId = `mostly-empty-field-${fieldMetadataItem.id}`;

  const canToggleField = !isLabelIdentifier;

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

  const { activateMetadataField } = useFieldMetadataItem();

  const { deleteOneFieldMetadataItem } = useDeleteOneFieldMetadataItem();

  const setSettingsObjectFields = useSetAtomFamilyState(
    settingsObjectFieldsFamilyState,
    { objectMetadataItemId: objectMetadataItem.id },
  );

  const handleToggleField = () => {
    setSettingsObjectFields((previousFields) => {
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

  const isRelatedObjectLinkable = isDefined(
    relationObjectMetadataItem?.namePlural,
  );

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
    <TableRow
      gridTemplateColumns={OBJECT_FIELD_TABLE_ROW_GRID_TEMPLATE_COLUMNS}
      onClick={mode === 'view' ? navigateToFieldEdit : undefined}
    >
      <UndecoratedLink to={linkToNavigate}>
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
            <StyledNameLabel title={fieldMetadataItem.label}>
              {fieldMetadataItem.label}
            </StyledNameLabel>
            {!fieldMetadataItem.isActive && (
              <SettingsNameCellSecondaryLabel>
                {t`Deactivated`}
              </SettingsNameCellSecondaryLabel>
            )}
            {fieldMetadataItem.isActive && isMostlyEmpty && (
              <Tooltip
                content={t`Appears filled in fewer than 5% of ${objectMetadataItem.labelPlural}. Fields that stay empty can be deactivated.`}
                delay={TooltipDelay.shortDelay}
              >
                <SettingsNameCellSecondaryLabel id={mostlyEmptyLabelId}>
                  {t`Mostly empty`}
                </SettingsNameCellSecondaryLabel>
              </Tooltip>
            )}
          </StyledNameContainer>
        </TableCell>
      </UndecoratedLink>

      <TableCell>
        <SettingsItemTypeTag
          item={{
            applicationId: fieldMetadataItem.applicationId,
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
      <TableCell
        align="center"
        padding={`0 ${themeCssVariables.spacing[1]} 0 ${themeCssVariables.spacing[2]}`}
      >
        {status === 'active' ? (
          mode === 'view' ? (
            <UndecoratedLink to={linkToNavigate}>
              <StyledIconChevronRightContainer>
                <IconChevronRight
                  size={theme.icon.size.md}
                  stroke={theme.icon.stroke.sm}
                />
              </StyledIconChevronRightContainer>
            </UndecoratedLink>
          ) : (
            canToggleField && (
              <LightIconButton
                emphasis="subtle"
                onClick={handleToggleField}
                aria-label={t`Deactivate field`}
              >
                <IconMinus />
              </LightIconButton>
            )
          )
        ) : mode === 'view' ? (
          <SettingsObjectFieldInactiveActionDropdown
            isCustomField={getIsMetadataItemCustom(fieldMetadataItem)}
            isSystemField={fieldMetadataItem.isSystem === true}
            readonly={readonly}
            fieldMetadataItemId={fieldMetadataItem.id}
            onEdit={navigateToFieldEdit}
            onActivate={() =>
              activateMetadataField(fieldMetadataItem.id, objectMetadataItem.id)
            }
            onDelete={() =>
              deleteOneFieldMetadataItem({
                idToDelete: fieldMetadataItem.id,
              })
            }
          />
        ) : (
          <LightIconButton
            emphasis="subtle"
            onClick={handleToggleField}
            aria-label={t`Add`}
          >
            <IconPlus />
          </LightIconButton>
        )}
      </TableCell>
    </TableRow>
  );
};
