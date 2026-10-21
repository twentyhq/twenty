import { styled } from '@linaria/react';
import { Controller, useFormContext } from 'react-hook-form';
import { type z } from 'zod';

import { useGetIsMetadataItemCustom } from '@/object-metadata/hooks/useGetIsMetadataItemCustom';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { fieldMetadataItemSchema } from '@/object-metadata/validation-schemas/fieldMetadataItemSchema';
import { SettingsOptionCardContentSwitch } from '@/settings/components/SettingsOptions/SettingsOptionCardContentSwitch';
import { IDENTIFIER_MAX_CHAR_LENGTH } from 'twenty-shared/metadata';
import { getErrorMessageFromError } from '@/object-metadata/utils/metadataLabelErrorMessages';
import { IconPicker } from '@/ui/input/components/IconPicker';
import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';
import { TooltipDelay } from '@/ui/layout/tooltip/constants/TooltipDelay';
import { useLingui } from '@lingui/react/macro';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { IconInfoCircle, IconRefresh } from 'twenty-ui/icon';
import { Collapsible } from 'twenty-ui/primitives/layout';
import { Card, Tooltip } from 'twenty-ui/primitives/surfaces';
import { useTheme, themeCssVariables } from 'twenty-ui/theme';
import { computeMetadataNameFromLabel } from '@/object-metadata/utils/computeMetadataNameFromLabel';

export const settingsDataModelFieldIconLabelFormSchema = (
  existingOtherLabels: string[] = [],
) => {
  return fieldMetadataItemSchema(existingOtherLabels)
    .pick({
      icon: true,
      label: true,
    })
    .merge(
      fieldMetadataItemSchema()
        .pick({
          name: true,
          isLabelSyncedWithName: true,
        })
        .partial(),
    );
};

type SettingsDataModelFieldIconLabelFormValues = z.infer<
  ReturnType<typeof settingsDataModelFieldIconLabelFormSchema>
>;

const StyledInputsContainer = styled.div`
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  margin-bottom: ${themeCssVariables.spacing[1]};
  width: 100%;
`;

const StyledApiSettingsContainer = styled.div`
  padding-top: ${themeCssVariables.spacing[4]};
`;

const StyledApiNameInputContainer = styled.div`
  padding-top: ${themeCssVariables.spacing[4]};
`;

type SettingsDataModelFieldIconLabelFormProps = {
  fieldMetadataItem?: FieldMetadataItem;
  maxLength?: number;
  isCreationMode?: boolean;
  readonly?: boolean;
};

export const SettingsDataModelFieldIconLabelForm = ({
  isCreationMode = false,
  fieldMetadataItem,
  maxLength,
  readonly = false,
}: SettingsDataModelFieldIconLabelFormProps) => {
  const {
    control,
    setValue,
    watch,
    formState: { errors },
    trigger,
  } = useFormContext<SettingsDataModelFieldIconLabelFormValues>();

  const theme = useTheme();
  const label = watch('label');

  const { t } = useLingui();

  const getIsMetadataItemCustom = useGetIsMetadataItemCustom();

  const isCustomField =
    isDefined(fieldMetadataItem) && getIsMetadataItemCustom(fieldMetadataItem);

  const labelTextInputId = `${fieldMetadataItem?.id}-label`;
  const nameTextInputId = `${fieldMetadataItem?.id}-name`;

  const isLabelSyncedWithName =
    watch('isLabelSyncedWithName') ??
    (isDefined(fieldMetadataItem)
      ? fieldMetadataItem.isLabelSyncedWithName
      : true);

  const fillNameFromLabel = (label: string) => {
    isDefined(label) &&
      setValue('name', computeMetadataNameFromLabel(label), {
        shouldDirty: true,
      });
  };

  const isRelation =
    fieldMetadataItem?.type === FieldMetadataType.RELATION ||
    fieldMetadataItem?.type === FieldMetadataType.MORPH_RELATION;

  const isCustomButNotRelationField = isCustomField && !isRelation;

  const canToggleSyncLabelWithName =
    !isCreationMode && isCustomButNotRelationField;

  const isLabelEditEnabled =
    isCreationMode ||
    (!isCreationMode &&
      ((isDefined(fieldMetadataItem) && !isCustomField) ||
        isCustomButNotRelationField));

  return (
    <>
      <StyledInputsContainer>
        <Controller
          name="icon"
          control={control}
          defaultValue={fieldMetadataItem?.icon ?? 'IconUsers'}
          render={({ field: { onChange, value } }) => (
            <IconPicker
              selectedIconKey={value ?? 'IconUsers'}
              onChange={({ iconKey }) => onChange(iconKey)}
              variant="outline"
              disabled={readonly}
            />
          )}
        />
        <Controller
          name="label"
          control={control}
          defaultValue={fieldMetadataItem?.label}
          render={({ field: { onChange, value } }) => (
            <SettingsTextInput
              instanceId={labelTextInputId}
              placeholder={t`Employees`}
              value={value}
              disabled={!isLabelEditEnabled || readonly}
              onChange={(value) => {
                onChange(value);
                trigger('label');
                if (
                  isCreationMode ||
                  (isLabelSyncedWithName === true && isCustomField)
                ) {
                  fillNameFromLabel(value);
                }
              }}
              error={getErrorMessageFromError(errors.label?.message)}
              maxLength={maxLength}
              fullWidth
            />
          )}
        />
      </StyledInputsContainer>
      {canToggleSyncLabelWithName && (
        <StyledApiSettingsContainer>
          <Controller
            name="isLabelSyncedWithName"
            control={control}
            defaultValue={fieldMetadataItem?.isLabelSyncedWithName ?? true}
            render={({ field: { onChange, value } }) => (
              <Card.Root>
                <SettingsOptionCardContentSwitch
                  Icon={IconRefresh}
                  title={t`Synchronize Field Label and API Name`}
                  description={t`Should changing a field's label also change the API name?`}
                  checked={value ?? true}
                  disabled={readonly}
                  onChange={(value) => {
                    onChange(value);
                    if (value) {
                      fillNameFromLabel(label);
                    }
                  }}
                />
              </Card.Root>
            )}
          />
          <Collapsible.Root open={!isLabelSyncedWithName}>
            <Collapsible.Panel dimension="height" containAnimation={false}>
              <StyledApiNameInputContainer>
                <Controller
                  name="name"
                  control={control}
                  defaultValue={fieldMetadataItem?.name}
                  render={({ field: { onChange, value } }) => (
                    <SettingsTextInput
                      instanceId={nameTextInputId}
                      label={t`API Name`}
                      placeholder={t`employees`}
                      value={value}
                      onChange={onChange}
                      readOnly={readonly}
                      fullWidth
                      maxLength={IDENTIFIER_MAX_CHAR_LENGTH}
                      RightIcon={() => (
                        <Tooltip
                          content={t`Input must be in camel case and cannot start with a number`}
                          sideOffset={5}
                          side="bottom"
                          positionMethod="fixed"
                          delay={TooltipDelay.shortDelay}
                        >
                          <IconInfoCircle
                            size={theme.icon.size.md}
                            color={theme.font.color.tertiary}
                          />
                        </Tooltip>
                      )}
                    />
                  )}
                />
              </StyledApiNameInputContainer>
            </Collapsible.Panel>
          </Collapsible.Root>
        </StyledApiSettingsContainer>
      )}
    </>
  );
};
