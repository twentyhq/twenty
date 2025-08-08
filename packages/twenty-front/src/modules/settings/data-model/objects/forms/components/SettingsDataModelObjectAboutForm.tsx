import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { AdvancedSettingsWrapper } from '@/settings/components/AdvancedSettingsWrapper';
import { SettingsOptionCardContentToggle } from '@/settings/components/SettingsOptions/SettingsOptionCardContentToggle';
import { OBJECT_NAME_MAXIMUM_LENGTH } from '@/settings/data-model/constants/ObjectNameMaximumLength';
import { SettingsDataModelObjectAboutFormValues } from '@/settings/data-model/validation-schemas/settingsDataModelObjectAboutFormSchema';
import { IconPicker } from '@/ui/input/components/IconPicker';
import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';
import { TextArea } from '@/ui/input/components/TextArea';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { plural } from 'pluralize';
import { Controller, useFormContext } from 'react-hook-form';
import { capitalize, isDefined } from 'twenty-shared/utils';
import {
  AppTooltip,
  IconInfoCircle,
  IconRefresh,
  TooltipDelay,
} from 'twenty-ui/display';
import { Card } from 'twenty-ui/layout';
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

export const SettingsDataModelObjectAboutForm = ({
  disableEdition = false,
  onNewDirtyField,
  objectMetadataItem,
}: SettingsDataModelObjectAboutFormProps) => {
  const { control, watch, setValue } =
    useFormContext<SettingsDataModelObjectAboutFormValues>();
  const { t } = useLingui();
  const theme = useTheme();

  const isLabelSyncedWithName = watch('isLabelSyncedWithName');
  const labelSingular = watch('labelSingular');
  const labelPlural = watch('labelPlural');
  watch('nameSingular');
  watch('namePlural');
  watch('description');
  watch('icon');

  const apiNameTooltipText =
    !isDefined(objectMetadataItem) || objectMetadataItem.isCustom
      ? isLabelSyncedWithName
        ? t`Deactivate "Synchronize Objects Labels and API Names" to set a custom API name`
        : t`Input must be in camel case and cannot start with a number`
      : t`Can't change API names for standard objects`;

  const fillLabelPlural = (labelSingular: string | undefined) => {
    if (!isDefined(labelSingular)) return;

    const labelPluralFromSingularLabel = plural(labelSingular);
    setValue('labelPlural', labelPluralFromSingularLabel, {
      shouldDirty: true,
    });
    if (isLabelSyncedWithName) {
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

  const descriptionTextAreaId = `${objectMetadataItem?.id}-description`;
  const labelSingularTextInputId = `${objectMetadataItem?.id}-label-singular`;
  const labelPluralTextInputId = `${objectMetadataItem?.id}-label-plural`;

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
            <SettingsTextInput
              instanceId={labelSingularTextInputId}
              // TODO we should discuss on how to notify user about form validation schema issue, from now just displaying red borders
              noErrorHelper={true}
              error={errors.labelSingular?.message}
              label={t`Singular`}
              placeholder={'Listing'}
              value={value}
              onChange={(value) => {
                onChange(capitalize(value));
                fillLabelPlural(capitalize(value));
                if (isLabelSyncedWithName === true) {
                  fillNameSingularFromLabelSingular(value);
                }
              }}
              onBlur={() => onNewDirtyField?.()}
              disabled={
                objectMetadataItem &&
                !objectMetadataItem?.isCustom &&
                isLabelSyncedWithName
              }
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
            <SettingsTextInput
              instanceId={labelPluralTextInputId}
              // TODO we should discuss on how to notify user about form validation schema issue, from now just displaying red borders
              noErrorHelper={true}
              error={errors.labelPlural?.message}
              label={t`Plural`}
              placeholder={t`Listings`}
              value={value}
              onChange={(value) => {
                onChange(capitalize(value));
                if (isLabelSyncedWithName === true) {
                  fillNamePluralFromLabelPlural(value);
                }
              }}
              onBlur={() => onNewDirtyField?.()}
              disabled={
                objectMetadataItem &&
                !objectMetadataItem?.isCustom &&
                isLabelSyncedWithName
              }
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
            textAreaId={descriptionTextAreaId}
            placeholder={t`Write a description`}
            minRows={4}
            value={value ?? undefined}
            onChange={(nextValue) => onChange(nextValue ?? null)}
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
                          <SettingsTextInput
                            instanceId={`${objectMetadataItem?.id}-${fieldName}`}
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
            {(!objectMetadataItem || objectMetadataItem?.isCustom) && (
              <AdvancedSettingsWrapper>
                <Controller
                  name="isLabelSyncedWithName"
                  control={control}
                  defaultValue={objectMetadataItem?.isLabelSyncedWithName}
                  render={({ field: { onChange, value } }) => (
                    <Card rounded>
                      <SettingsOptionCardContentToggle
                        Icon={IconRefresh}
                        title={t`Synchronize Objects Labels and API Names`}
                        description={t`Should changing an object's label also change the API?`}
                        checked={value ?? true}
                        advancedMode
                        onChange={(value) => {
                          onChange(value);
                          const isCustomObject =
                            isDefined(objectMetadataItem) &&
                            objectMetadataItem.isCustom;
                          const isbeingCreatedObject =
                            !isDefined(objectMetadataItem);
                          if (
                            value === true &&
                            (isCustomObject || isbeingCreatedObject)
                          ) {
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
            )}
          </StyledAdvancedSettingsSectionInputWrapper>
        </StyledAdvancedSettingsContainer>
      </StyledAdvancedSettingsOuterContainer>
    </>
  );
};
