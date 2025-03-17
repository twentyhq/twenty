import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { AdvancedSettingsWrapper } from '@/settings/components/AdvancedSettingsWrapper';
import { SettingsOptionCardContentToggle } from '@/settings/components/SettingsOptions/SettingsOptionCardContentToggle';
import { SETTINGS_OBJECT_MODEL_IS_LABEL_SYNCED_WITH_NAME_LABEL_DEFAULT_VALUE } from '@/settings/constants/SettingsObjectModel';
import { OBJECT_NAME_MAXIMUM_LENGTH } from '@/settings/data-model/constants/ObjectNameMaximumLength';
import { SettingsDataModelObjectAboutFormValues } from '@/settings/data-model/validation-schemas/settingsDataModelObjectAboutFormSchema';
import { IconPicker } from '@/ui/input/components/IconPicker';
import { TextArea } from '@/ui/input/components/TextArea';
import { TextInput } from '@/ui/input/components/TextInput';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { plural } from 'pluralize';
import { Controller, useFormContext } from 'react-hook-form';
import { isDefined } from 'twenty-shared';
import {
  AppTooltip,
  Card,
  IconInfoCircle,
  IconRefresh,
  TooltipDelay,
} from 'twenty-ui';
import { StringKeyOf } from 'type-fest';
import { computeMetadataNameFromLabel } from '~/pages/settings/data-model/utils/compute-metadata-name-from-label.utils';

type SettingsDataModelObjectAboutFormProps = {
  disableEdition?: boolean;
  objectMetadataItem?: ObjectMetadataItem;
  onNewDirtyField?: () => void;
};

const StyledInputsContainer = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  margin-bottom: ${({ theme }) => theme.spacing(2)};
  width: 100%;
`;

const StyledInputContainer = styled.div`
  display: flex;
  flex-direction: column;
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

const StyledLabel = styled.span`
  color: ${({ theme }) => theme.font.color.light};
  font-size: ${({ theme }) => theme.font.size.xs};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  margin-bottom: ${({ theme }) => theme.spacing(1)};
`;

const infoCircleElementId = 'info-circle-id';

export const IS_LABEL_SYNCED_WITH_NAME_LABEL = 'isLabelSyncedWithName';

export const SettingsDataModelObjectAboutForm = ({
  disableEdition = false,
  onNewDirtyField,
  objectMetadataItem,
}: SettingsDataModelObjectAboutFormProps) => {
  const { control, watch, setValue } =
    useFormContext<SettingsDataModelObjectAboutFormValues>();
  const { t } = useLingui();
  const theme = useTheme();

  const isLabelSyncedWithName =
    watch(IS_LABEL_SYNCED_WITH_NAME_LABEL) ??
    (isDefined(objectMetadataItem)
      ? objectMetadataItem.isLabelSyncedWithName
      : SETTINGS_OBJECT_MODEL_IS_LABEL_SYNCED_WITH_NAME_LABEL_DEFAULT_VALUE);
  const labelSingular = watch('labelSingular');
  const labelPlural = watch('labelPlural');
  watch('nameSingular');
  watch('namePlural');
  watch('description');
  watch('icon');
  const apiNameTooltipText = isLabelSyncedWithName
    ? t`Deactivate "Synchronize Objects Labels and API Names" to set a custom API name`
    : t`Input must be in camel case and cannot start with a number`;

  const fillLabelPlural = (labelSingular: string | undefined) => {
    if (!isDefined(labelSingular)) return;

    const labelPluralFromSingularLabel = plural(labelSingular);
    setValue('labelPlural', labelPluralFromSingularLabel, {
      shouldDirty: true,
    });
    if (isLabelSyncedWithName === true) {
      fillNamePluralFromLabelPlural(labelPluralFromSingularLabel);
    }
  };

  const fillNameSingularFromLabelSingular = (
    labelSingular: string | undefined,
  ) => {
    if (!isDefined(labelSingular)) return;

    setValue('nameSingular', computeMetadataNameFromLabel(labelSingular), {
      shouldDirty: true,
    });
  };

  const fillNamePluralFromLabelPlural = (labelPlural: string | undefined) => {
    if (!isDefined(labelPlural)) return;

    setValue('namePlural', computeMetadataNameFromLabel(labelPlural), {
      shouldDirty: true,
    });
  };

  return (
    <>
      <StyledInputsContainer>
        <StyledInputContainer>
          <StyledLabel>{t`Icon`}</StyledLabel>
          <Controller
            name="icon"
            control={control}
            defaultValue={objectMetadataItem?.icon ?? 'IconListNumbers'}
            render={({ field: { onChange, value } }) => (
              <IconPicker
                disabled={disableEdition}
                selectedIconKey={value}
                onChange={({ iconKey }) => {
                  onChange(iconKey);
                  onNewDirtyField?.();
                }}
              />
            )}
          />
        </StyledInputContainer>
        <Controller
          key={`object-labelSingular-text-input`}
          name={'labelSingular'}
          control={control}
          defaultValue={objectMetadataItem?.labelSingular ?? ''}
          render={({ field: { onChange, value }, formState: { errors } }) => (
            <TextInput
              // TODO we should discuss on how to notify user about form validation schema issue, from now just displaying red borders
              noErrorHelper={true}
              error={errors.labelSingular?.message}
              label={t`Singular`}
              placeholder={'Listing'}
              value={value}
              onChange={(value) => {
                onChange(value);
                fillLabelPlural(value);
                if (isLabelSyncedWithName === true) {
                  fillNameSingularFromLabelSingular(value);
                }
              }}
              onBlur={() => onNewDirtyField?.()}
              disabled={disableEdition}
              fullWidth
              maxLength={OBJECT_NAME_MAXIMUM_LENGTH}
            />
          )}
        />
        <Controller
          key={`object-labelPlural-text-input`}
          name={'labelPlural'}
          control={control}
          defaultValue={objectMetadataItem?.labelPlural ?? ''}
          render={({ field: { onChange, value }, formState: { errors } }) => (
            <TextInput
              // TODO we should discuss on how to notify user about form validation schema issue, from now just displaying red borders
              noErrorHelper={true}
              error={errors.labelPlural?.message}
              label={t`Plural`}
              placeholder={t`Listings`}
              value={value}
              onChange={(value) => {
                onChange(value);
                if (isLabelSyncedWithName === true) {
                  fillNamePluralFromLabelPlural(value);
                }
              }}
              onBlur={() => onNewDirtyField?.()}
              disabled={disableEdition}
              fullWidth
              maxLength={OBJECT_NAME_MAXIMUM_LENGTH}
            />
          )}
        />
      </StyledInputsContainer>
      <Controller
        name="description"
        control={control}
        render={({ field: { onChange, value } }) => (
          <TextArea
            placeholder={t`Write a description`}
            minRows={4}
            value={value ?? undefined}
            onChange={(nextValue) => onChange(nextValue ?? null)}
            disabled={disableEdition}
            onBlur={() => onNewDirtyField?.()}
          />
        )}
      />
      <StyledAdvancedSettingsOuterContainer>
        <StyledAdvancedSettingsContainer>
          <StyledAdvancedSettingsSectionInputWrapper>
            {[
              {
                label: t`API Name (Singular)`,
                fieldName:
                  'nameSingular' as const satisfies StringKeyOf<ObjectMetadataItem>,
                placeholder: `listing`,
                defaultValue: objectMetadataItem?.nameSingular ?? '',
                disableEdition: disableEdition || isLabelSyncedWithName,
                tooltip: apiNameTooltipText,
              },
              {
                label: t`API Name (Plural)`,
                fieldName:
                  'namePlural' as const satisfies StringKeyOf<ObjectMetadataItem>,
                placeholder: `listings`,
                defaultValue: objectMetadataItem?.namePlural ?? '',
                disableEdition: disableEdition || isLabelSyncedWithName,
                tooltip: apiNameTooltipText,
              },
            ].map(
              ({
                fieldName,
                label,
                placeholder,
                disableEdition,
                tooltip,
                defaultValue,
              }) => (
                <AdvancedSettingsWrapper
                  key={`object-${fieldName}-text-input`}
                  dotPosition="top"
                >
                  <StyledInputContainer>
                    <Controller
                      name={fieldName}
                      control={control}
                      defaultValue={defaultValue}
                      render={({
                        field: { onChange, value },
                        formState: { errors },
                      }) => (
                        <>
                          <TextInput
                            label={label}
                            placeholder={placeholder}
                            value={value}
                            onChange={onChange}
                            disabled={disableEdition}
                            fullWidth
                            maxLength={OBJECT_NAME_MAXIMUM_LENGTH}
                            onBlur={() => onNewDirtyField?.()}
                            error={errors[fieldName]?.message}
                            // TODO we should discuss on how to notify user about form validation schema issue, from now just displaying red borders
                            noErrorHelper={true}
                            RightIcon={() =>
                              tooltip && (
                                <>
                                  <IconInfoCircle
                                    id={infoCircleElementId + fieldName}
                                    size={theme.icon.size.md}
                                    color={theme.font.color.tertiary}
                                    style={{ outline: 'none' }}
                                  />
                                  <AppTooltip
                                    anchorSelect={`#${infoCircleElementId}${fieldName}`}
                                    content={tooltip}
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
                  </StyledInputContainer>
                </AdvancedSettingsWrapper>
              ),
            )}
            <AdvancedSettingsWrapper>
              <Controller
                name={IS_LABEL_SYNCED_WITH_NAME_LABEL}
                control={control}
                defaultValue={
                  objectMetadataItem?.isLabelSyncedWithName ??
                  SETTINGS_OBJECT_MODEL_IS_LABEL_SYNCED_WITH_NAME_LABEL_DEFAULT_VALUE
                }
                render={({ field: { onChange, value } }) => (
                  <Card rounded>
                    <SettingsOptionCardContentToggle
                      Icon={IconRefresh}
                      title={t`Synchronize Objects Labels and API Names`}
                      description={t`Should changing an object's label also change the API?`}
                      checked={value ?? true}
                      disabled={
                        isDefined(objectMetadataItem) &&
                        !objectMetadataItem.isCustom
                      }
                      advancedMode
                      onChange={(value) => {
                        onChange(value);
                        if (value === true) {
                          fillNamePluralFromLabelPlural(labelPlural);
                          fillNameSingularFromLabelSingular(labelSingular);
                        }
                        onNewDirtyField?.();
                      }}
                    />
                  </Card>
                )}
              />
            </AdvancedSettingsWrapper>
          </StyledAdvancedSettingsSectionInputWrapper>
        </StyledAdvancedSettingsContainer>
      </StyledAdvancedSettingsOuterContainer>
    </>
  );
};
