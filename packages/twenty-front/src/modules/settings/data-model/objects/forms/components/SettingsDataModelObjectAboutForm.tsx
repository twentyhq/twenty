import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { AdvancedSettingsWrapper } from '@/settings/components/AdvancedSettingsWrapper';
import { SettingsOptionCardContentToggle } from '@/settings/components/SettingsOptions/SettingsOptionCardContentToggle';
import { OBJECT_NAME_MAXIMUM_LENGTH } from '@/settings/data-model/constants/ObjectNameMaximumLength';
import { type SettingsDataModelObjectAboutFormValues } from '@/settings/data-model/validation-schemas/settingsDataModelObjectAboutFormSchema';
import { IconPicker } from '@/ui/input/components/IconPicker';
import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';
import { TextArea } from '@/ui/input/components/TextArea';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { plural } from 'pluralize';
import { useContext } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { SettingsPath } from 'twenty-shared/types';
import { capitalize, isDefined } from 'twenty-shared/utils';
import {
  AppTooltip,
  IconInfoCircle,
  IconLink,
  IconRefresh,
  TooltipDelay,
} from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { Card } from 'twenty-ui/layout';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';
import { parseThemeColor } from 'twenty-ui/utilities';
import { type StringKeyOf } from 'type-fest';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';
import { computeMetadataNamesFromLabels } from '~/pages/settings/data-model/utils/computeMetadataNamesFromLabels';

type SettingsDataModelObjectAboutFormProps = {
  disableEdition?: boolean;
  objectMetadataItem?: EnrichedObjectMetadataItem;
  onNewDirtyField?: () => void;
  conflictingObjectMetadataItem?: EnrichedObjectMetadataItem;
};

const StyledInputsContainer = styled.div`
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  margin-bottom: ${themeCssVariables.spacing[2]};
  width: 100%;
`;

const StyledInputContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const StyledAdvancedSettingsSectionInputWrapper = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[4]};
  width: 100%;
`;

const StyledAdvancedSettingsOuterContainer = styled.div`
  padding-top: ${themeCssVariables.spacing[4]};
`;

const StyledAdvancedSettingsContainer = styled.div`
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  position: relative;
  width: 100%;
`;

const StyledLabel = styled.span`
  color: ${themeCssVariables.font.color.light};
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  margin-bottom: ${themeCssVariables.spacing[1]};
`;

const StyledConflictBanner = styled.div`
  align-items: center;
  background-color: ${themeCssVariables.accent.secondary};
  border-radius: ${themeCssVariables.border.radius.md};
  box-sizing: border-box;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  margin-bottom: ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing[2]};
`;

const StyledBannerContent = styled.div`
  align-items: center;
  display: flex;
  flex: 1;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledBannerText = styled.span`
  color: ${themeCssVariables.color.blue};
  flex: 1;
`;

const StyledConflictButtonContainer = styled.div`
  > button {
    border-color: ${themeCssVariables.color.blue};
    color: ${themeCssVariables.color.blue};
    &:hover {
      background: ${themeCssVariables.accent.secondary};
    }
    &:focus-visible {
      box-shadow: 0 0 0 3px ${themeCssVariables.accent.tertiary};
    }
  }
`;

const infoCircleElementId = 'info-circle-id';

export const SettingsDataModelObjectAboutForm = ({
  disableEdition = false,
  onNewDirtyField,
  objectMetadataItem,
  conflictingObjectMetadataItem,
}: SettingsDataModelObjectAboutFormProps) => {
  const { theme } = useContext(ThemeContext);
  const { control, watch, setValue } =
    useFormContext<SettingsDataModelObjectAboutFormValues>();
  const { t } = useLingui();
  const navigateSettings = useNavigateSettings();

  const isLabelSyncedWithName = watch('isLabelSyncedWithName');
  const labelSingular = watch('labelSingular');
  const labelPlural = watch('labelPlural');
  const isStandardObject =
    isDefined(objectMetadataItem?.isCustom) && !objectMetadataItem.isCustom;
  const showObjectColorInIconPicker =
    !isStandardObject &&
    (!isDefined(objectMetadataItem) || objectMetadataItem.isCustom);
  watch('description');
  watch('icon');
  const objectIconColor = watch('color');

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
      shouldValidate: true,
    });
    if (isLabelSyncedWithName) {
      fillNamesFromLabels(labelSingular, labelPluralFromSingularLabel);
    }
  };

  const fillNamesFromLabels = (
    currentLabelSingular: string,
    currentLabelPlural: string,
  ) => {
    const { nameSingular, namePlural } = computeMetadataNamesFromLabels(
      currentLabelSingular,
      currentLabelPlural,
    );

    setValue('nameSingular', nameSingular, {
      shouldDirty: true,
      shouldValidate: true,
    });
    setValue('namePlural', namePlural, {
      shouldDirty: true,
      shouldValidate: true,
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
                disabled={disableEdition}
                dropdownId={
                  isDefined(objectMetadataItem)
                    ? `settings-object-about-icon-${objectMetadataItem.id}`
                    : 'settings-new-object-about-icon'
                }
                iconColorPicker={
                  showObjectColorInIconPicker
                    ? {
                        selectedColor: parseThemeColor(objectIconColor),
                        onColorChange: (nextColor) => {
                          setValue('color', nextColor, {
                            shouldDirty: true,
                            shouldValidate: true,
                          });
                          onNewDirtyField?.();
                        },
                      }
                    : undefined
                }
                onChange={({ iconKey }) => {
                  if (disableEdition) {
                    return;
                  }
                  onChange(iconKey);
                  onNewDirtyField?.();
                }}
              />
            )}
          />
        </StyledInputContainer>
        <Controller
          key={`object-labelSingular-text-input`}
          name="labelSingular"
          control={control}
          defaultValue={objectMetadataItem?.labelSingular ?? ''}
          render={({ field: { onChange, value }, formState: { errors } }) => (
            <SettingsTextInput
              instanceId={labelSingularTextInputId}
              // TODO we should discuss on how to notify user about form validation schema issue, from now just displaying red borders
              noErrorHelper={true}
              error={errors.labelSingular?.message}
              label={t`Singular`}
              placeholder={t`Listing`}
              value={value}
              onChange={(value) => {
                onChange(capitalize(value));
                fillLabelPlural(capitalize(value));
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
          name="labelPlural"
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
                  fillNamesFromLabels(labelSingular, capitalize(value));
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
            textAreaId={descriptionTextAreaId}
            placeholder={t`Write a description`}
            minRows={4}
            value={value ?? undefined}
            onChange={(nextValue) => onChange(nextValue ?? null)}
            onBlur={() => onNewDirtyField?.()}
            disabled={disableEdition}
          />
        )}
      />
      <StyledAdvancedSettingsOuterContainer>
        <StyledAdvancedSettingsContainer>
          <StyledAdvancedSettingsSectionInputWrapper>
            {isDefined(conflictingObjectMetadataItem) && (
              <StyledConflictBanner>
                <StyledBannerContent>
                  <IconInfoCircle
                    color={theme.color.blue}
                    size={theme.icon.size.md}
                  />
                  <StyledBannerText>
                    {t`An object with this name already exists`}
                  </StyledBannerText>
                </StyledBannerContent>
                <StyledConflictButtonContainer>
                  <Button
                    size="small"
                    variant="secondary"
                    accent="blue"
                    title={t`Open`}
                    onClick={() =>
                      navigateSettings(SettingsPath.ObjectDetail, {
                        objectNamePlural:
                          conflictingObjectMetadataItem.namePlural,
                      })
                    }
                  />
                </StyledConflictButtonContainer>
              </StyledConflictBanner>
            )}
            {[
              {
                label: t`API Name (Singular)`,
                fieldName:
                  'nameSingular' as const satisfies StringKeyOf<EnrichedObjectMetadataItem>,
                placeholder: `listing`,
                defaultValue: objectMetadataItem?.nameSingular ?? '',
                disableEdition:
                  isStandardObject || disableEdition || isLabelSyncedWithName,
                tooltip: apiNameTooltipText,
              },
              {
                label: t`API Name (Plural)`,
                fieldName:
                  'namePlural' as const satisfies StringKeyOf<EnrichedObjectMetadataItem>,
                placeholder: `listings`,
                defaultValue: objectMetadataItem?.namePlural ?? '',
                disableEdition:
                  isStandardObject || disableEdition || isLabelSyncedWithName,
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
            {!isStandardObject && (
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
                        disabled={disableEdition}
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
                            fillNamesFromLabels(labelSingular, labelPlural);
                          }
                          onNewDirtyField?.();
                        }}
                      />
                    </Card>
                  )}
                />
              </AdvancedSettingsWrapper>
            )}
            {!isDefined(objectMetadataItem) && (
              <AdvancedSettingsWrapper>
                <Controller
                  name="skipNameField"
                  control={control}
                  defaultValue={false}
                  render={({ field: { onChange, value } }) => (
                    <Card rounded>
                      <SettingsOptionCardContentToggle
                        Icon={IconLink}
                        title={t`Skip creating a Name field `}
                        description={t`Useful for pivot/junction tables`}
                        checked={value ?? false}
                        advancedMode
                        disabled={disableEdition}
                        onChange={(value) => {
                          onChange(value);
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
