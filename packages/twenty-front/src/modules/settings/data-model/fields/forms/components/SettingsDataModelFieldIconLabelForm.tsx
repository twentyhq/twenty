import styled from '@emotion/styled';
import { Controller, useFormContext } from 'react-hook-form';
import { z } from 'zod';

import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { fieldMetadataItemSchema } from '@/object-metadata/validation-schemas/fieldMetadataItemSchema';
import { AdvancedSettingsWrapper } from '@/settings/components/AdvancedSettingsWrapper';
import { SettingsOptionCardContentToggle } from '@/settings/components/SettingsOptions/SettingsOptionCardContentToggle';
import { DATABASE_IDENTIFIER_MAXIMUM_LENGTH } from '@/settings/data-model/constants/DatabaseIdentifierMaximumLength';
import { getErrorMessageFromError } from '@/settings/data-model/fields/forms/utils/errorMessages';
import { IconPicker } from '@/ui/input/components/IconPicker';
import { TextInput } from '@/ui/input/components/TextInput';
import { useTheme } from '@emotion/react';
import { useLingui } from '@lingui/react/macro';
import {
  AppTooltip,
  Card,
  IconInfoCircle,
  IconRefresh,
  isDefined,
  TooltipDelay,
} from 'twenty-ui';
import { computeMetadataNameFromLabel } from '~/pages/settings/data-model/utils/compute-metadata-name-from-label.utils';

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
  gap: ${({ theme }) => theme.spacing(2)};
  margin-bottom: ${({ theme }) => theme.spacing(2)};
  width: 100%;
`;

const StyledAdvancedSettingsSectionInputWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};
  width: 100%;
  flex: 1;
`;

const StyledAdvancedSettingsOuterContainer = styled.div`
  padding-top: ${({ theme }) => theme.spacing(4)};
`;

const StyledAdvancedSettingsContainer = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  position: relative;
  width: 100%;
`;

type SettingsDataModelFieldIconLabelFormProps = {
  disabled?: boolean;
  fieldMetadataItem?: FieldMetadataItem;
  maxLength?: number;
  canToggleSyncLabelWithName?: boolean;
};

export const SettingsDataModelFieldIconLabelForm = ({
  canToggleSyncLabelWithName = true,
  disabled,
  fieldMetadataItem,
  maxLength,
}: SettingsDataModelFieldIconLabelFormProps) => {
  const {
    control,
    setValue,
    watch,
    formState: { errors },
  } = useFormContext<SettingsDataModelFieldIconLabelFormValues>();

  const theme = useTheme();

  const { t } = useLingui();

  const isLabelSyncedWithName =
    watch('isLabelSyncedWithName') ??
    (isDefined(fieldMetadataItem)
      ? fieldMetadataItem.isLabelSyncedWithName
      : true);
  const label = watch('label');

  const apiNameTooltipText = isLabelSyncedWithName
    ? t`Deactivate "Synchronize Objects Labels and API Names" to set a custom API name`
    : t`Input must be in camel case and cannot start with a number`;

  const fillNameFromLabel = (label: string) => {
    isDefined(label) &&
      setValue('name', computeMetadataNameFromLabel(label), {
        shouldDirty: true,
      });
  };

  return (
    <>
      <StyledInputsContainer>
        <Controller
          name="icon"
          control={control}
          defaultValue={fieldMetadataItem?.icon ?? 'IconUsers'}
          render={({ field: { onChange, value } }) => (
            <IconPicker
              disabled={disabled}
              selectedIconKey={value ?? ''}
              onChange={({ iconKey }) => onChange(iconKey)}
              variant="primary"
            />
          )}
        />
        <Controller
          name="label"
          control={control}
          defaultValue={fieldMetadataItem?.label}
          render={({ field: { onChange, value } }) => (
            <TextInput
              placeholder={t`Employees`}
              value={value}
              onChange={(value) => {
                onChange(value);
                if (isLabelSyncedWithName === true) {
                  fillNameFromLabel(value);
                }
              }}
              error={getErrorMessageFromError(errors.label?.message)}
              disabled={disabled}
              maxLength={maxLength}
              fullWidth
            />
          )}
        />
      </StyledInputsContainer>
      {canToggleSyncLabelWithName && (
        <StyledAdvancedSettingsOuterContainer>
          <AdvancedSettingsWrapper>
            <StyledAdvancedSettingsContainer>
              <StyledAdvancedSettingsSectionInputWrapper>
                <StyledInputsContainer>
                  <Controller
                    name="name"
                    control={control}
                    defaultValue={fieldMetadataItem?.name}
                    render={({ field: { onChange, value } }) => (
                      <>
                        <TextInput
                          label={t`API Name`}
                          placeholder={t`employees`}
                          value={value}
                          onChange={onChange}
                          disabled={
                            disabled || (isLabelSyncedWithName ?? false)
                          }
                          fullWidth
                          maxLength={DATABASE_IDENTIFIER_MAXIMUM_LENGTH}
                          RightIcon={() =>
                            apiNameTooltipText && (
                              <>
                                <IconInfoCircle
                                  id="info-circle-id-name"
                                  size={theme.icon.size.md}
                                  color={theme.font.color.tertiary}
                                  style={{ outline: 'none' }}
                                />
                                <AppTooltip
                                  anchorSelect="#info-circle-id-name"
                                  content={apiNameTooltipText}
                                  offset={5}
                                  noArrow
                                  place="bottom"
                                  positionStrategy="fixed"
                                  delay={TooltipDelay.shortDelay}
                                />
                              </>
                            )
                          }
                        />
                      </>
                    )}
                  />
                </StyledInputsContainer>
                <Controller
                  name="isLabelSyncedWithName"
                  control={control}
                  defaultValue={
                    fieldMetadataItem?.isLabelSyncedWithName ?? true
                  }
                  render={({ field: { onChange, value } }) => (
                    <Card rounded>
                      <SettingsOptionCardContentToggle
                        Icon={IconRefresh}
                        title={t`Synchronize Field Label and API Name`}
                        description={t`Should changing a field's label also change the API name?`}
                        checked={value ?? true}
                        disabled={
                          isDefined(fieldMetadataItem) &&
                          !fieldMetadataItem.isCustom
                        }
                        advancedMode
                        onChange={(value) => {
                          onChange(value);
                          if (value === true) {
                            fillNameFromLabel(label);
                          }
                        }}
                      />
                    </Card>
                  )}
                />
              </StyledAdvancedSettingsSectionInputWrapper>
            </StyledAdvancedSettingsContainer>
          </AdvancedSettingsWrapper>
        </StyledAdvancedSettingsOuterContainer>
      )}
    </>
  );
};
