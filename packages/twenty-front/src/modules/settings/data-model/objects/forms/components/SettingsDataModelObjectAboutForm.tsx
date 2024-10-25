import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { objectMetadataItemSchema } from '@/object-metadata/validation-schemas/objectMetadataItemSchema';
import { OBJECT_NAME_MAXIMUM_LENGTH } from '@/settings/data-model/constants/ObjectNameMaximumLength';
import { SyncObjectLabelAndNameToggle } from '@/settings/data-model/objects/forms/components/SyncObjectLabelAndNameToggle';
import { useExpandedHeightAnimation } from '@/settings/hooks/useExpandedHeightAnimation';
import { IconPicker } from '@/ui/input/components/IconPicker';
import { TextArea } from '@/ui/input/components/TextArea';
import { TextInput } from '@/ui/input/components/TextInput';
import { isAdvancedModeEnabledState } from '@/ui/navigation/navigation-drawer/states/isAdvancedModeEnabledState';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { AnimatePresence, motion } from 'framer-motion';
import { plural } from 'pluralize';
import { Controller, useFormContext } from 'react-hook-form';
import { useRecoilValue } from 'recoil';
import {
  AppTooltip,
  IconInfoCircle,
  IconTool,
  MAIN_COLORS,
  TooltipDelay,
} from 'twenty-ui';
import { z } from 'zod';
import { computeMetadataNameFromLabelOrThrow } from '~/pages/settings/data-model/utils/compute-metadata-name-from-label.utils';
import { isDefined } from '~/utils/isDefined';

export const settingsDataModelObjectAboutFormSchema = objectMetadataItemSchema
  .pick({
    description: true,
    icon: true,
    labelPlural: true,
    labelSingular: true,
  })
  .merge(
    objectMetadataItemSchema
      .pick({
        nameSingular: true,
        namePlural: true,
        shouldSyncLabelAndName: true,
      })
      .partial(),
  );

type SettingsDataModelObjectAboutFormValues = z.infer<
  typeof settingsDataModelObjectAboutFormSchema
>;

type SettingsDataModelObjectAboutFormProps = {
  disabled?: boolean;
  disableNameEdit?: boolean;
  objectMetadataItem?: ObjectMetadataItem;
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

const StyledSectionWrapper = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing(4)};
`;

const StyledAdvancedSettingsSectionInputWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};
  width: 100%;
`;

const StyledAdvancedSettingsContainer = styled.div`
  display: flex;
  width: 100%;
  gap: ${({ theme }) => theme.spacing(2)};
  position: relative;
`;

const StyledIconToolContainer = styled.div`
  border-right: 1px solid ${MAIN_COLORS.yellow};
  display: flex;
  left: ${({ theme }) => theme.spacing(-5)};
  position: absolute;
  height: 100%;
`;

const StyledIconTool = styled(IconTool)`
  margin-right: ${({ theme }) => theme.spacing(0.5)};
`;

const StyledLabel = styled.span`
  color: ${({ theme }) => theme.font.color.light};
  font-size: ${({ theme }) => theme.font.size.xs};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  margin-bottom: ${({ theme }) => theme.spacing(1)};
`;

const infoCircleElementId = 'info-circle-id';

export const SettingsDataModelObjectAboutForm = ({
  disabled,
  disableNameEdit,
  objectMetadataItem,
}: SettingsDataModelObjectAboutFormProps) => {
  const { control, watch, setValue } =
    useFormContext<SettingsDataModelObjectAboutFormValues>();
  const theme = useTheme();
  const isAdvancedModeEnabled = useRecoilValue(isAdvancedModeEnabledState);
  const { contentRef, motionAnimationVariants } = useExpandedHeightAnimation(
    isAdvancedModeEnabled,
  );

  const shouldSyncLabelAndName = watch('shouldSyncLabelAndName');
  const labelSingular = watch('labelSingular');
  const labelPlural = watch('labelPlural');
  const apiNameTooltipText = shouldSyncLabelAndName
    ? 'Deactivate "Synchronize Objects Labels and API Names" to set a custom API name'
    : 'Input must be in camel case and cannot start with a number';

  const fillLabelPlural = (labelSingular: string) => {
    const newLabelPluralValue = isDefined(labelSingular)
      ? plural(labelSingular)
      : '';
    setValue('labelPlural', newLabelPluralValue, {
      shouldDirty: isDefined(labelSingular) ? true : false,
    });
    if (shouldSyncLabelAndName === true) {
      fillNamePluralFromLabelPlural(newLabelPluralValue);
    }
  };

  const fillNameSingularFromLabelSingular = (labelSingular: string) => {
    isDefined(labelSingular) &&
      setValue(
        'nameSingular',
        computeMetadataNameFromLabelOrThrow(labelSingular),
        { shouldDirty: false },
      );
  };

  const fillNamePluralFromLabelPlural = (labelPlural: string) => {
    isDefined(labelPlural) &&
      setValue('namePlural', computeMetadataNameFromLabelOrThrow(labelPlural), {
        shouldDirty: false,
      });
  };

  return (
    <>
      <StyledSectionWrapper>
        <StyledInputsContainer>
          <StyledInputContainer>
            <StyledLabel>Icon</StyledLabel>
            <Controller
              name="icon"
              control={control}
              defaultValue={objectMetadataItem?.icon ?? 'IconListNumbers'}
              render={({ field: { onChange, value } }) => (
                <IconPicker
                  disabled={disabled}
                  selectedIconKey={value}
                  onChange={({ iconKey }) => onChange(iconKey)}
                />
              )}
            />
          </StyledInputContainer>
          <Controller
            key={`object-labelSingular-text-input`}
            name={'labelSingular'}
            control={control}
            defaultValue={objectMetadataItem?.labelSingular}
            render={({ field: { onChange, value } }) => (
              <TextInput
                label={'Singular'}
                placeholder={'Listing'}
                value={value}
                onChange={(value) => {
                  onChange(value);
                  fillLabelPlural(value);
                  if (shouldSyncLabelAndName === true) {
                    fillNameSingularFromLabelSingular(value);
                  }
                }}
                disabled={disabled || disableNameEdit}
                fullWidth
                maxLength={OBJECT_NAME_MAXIMUM_LENGTH}
              />
            )}
          />
          <Controller
            key={`object-labelPlural-text-input`}
            name={'labelPlural'}
            control={control}
            defaultValue={objectMetadataItem?.labelPlural}
            render={({ field: { onChange, value } }) => (
              <TextInput
                label={'Plural'}
                placeholder={'Listings'}
                value={value}
                onChange={(value) => {
                  onChange(value);
                  if (shouldSyncLabelAndName === true) {
                    fillNamePluralFromLabelPlural(value);
                  }
                }}
                disabled={disabled || disableNameEdit}
                fullWidth
                maxLength={OBJECT_NAME_MAXIMUM_LENGTH}
              />
            )}
          />
        </StyledInputsContainer>
        <Controller
          name="description"
          control={control}
          defaultValue={objectMetadataItem?.description ?? null}
          render={({ field: { onChange, value } }) => (
            <TextArea
              placeholder="Write a description"
              minRows={4}
              value={value ?? undefined}
              onChange={(nextValue) => onChange(nextValue ?? null)}
              disabled={disabled}
            />
          )}
        />
      </StyledSectionWrapper>
      <AnimatePresence>
        {isAdvancedModeEnabled && (
          <motion.div
            ref={contentRef}
            initial="initial"
            animate="animate"
            exit="exit"
            variants={motionAnimationVariants}
          >
            <StyledAdvancedSettingsContainer>
              <StyledIconToolContainer>
                <StyledIconTool size={12} color={MAIN_COLORS.yellow} />
              </StyledIconToolContainer>
              <StyledAdvancedSettingsSectionInputWrapper>
                {[
                  {
                    label: 'API Name (Singular)',
                    fieldName: 'nameSingular' as const,
                    placeholder: 'listing',
                    defaultValue: objectMetadataItem?.nameSingular,
                    disabled:
                      disabled || disableNameEdit || shouldSyncLabelAndName,
                    tooltip: apiNameTooltipText,
                  },
                  {
                    label: 'API Name (Plural)',
                    fieldName: 'namePlural' as const,
                    placeholder: 'listings',
                    defaultValue: objectMetadataItem?.namePlural,
                    disabled:
                      disabled || disableNameEdit || shouldSyncLabelAndName,
                    tooltip: apiNameTooltipText,
                  },
                ].map(
                  ({
                    defaultValue,
                    fieldName,
                    label,
                    placeholder,
                    disabled,
                    tooltip,
                  }) => (
                    <StyledInputContainer
                      key={`object-${fieldName}-text-input`}
                    >
                      <Controller
                        name={fieldName}
                        control={control}
                        defaultValue={defaultValue}
                        render={({ field: { onChange, value } }) => (
                          <>
                            <TextInput
                              label={label}
                              placeholder={placeholder}
                              value={value}
                              onChange={onChange}
                              disabled={disabled}
                              fullWidth
                              maxLength={OBJECT_NAME_MAXIMUM_LENGTH}
                              RightIcon={() =>
                                tooltip && (
                                  <>
                                    <IconInfoCircle
                                      id={infoCircleElementId + fieldName}
                                      size={theme.icon.size.md}
                                      color={theme.font.color.tertiary}
                                    />

                                    <AppTooltip
                                      anchorSelect={`#${infoCircleElementId}${fieldName}`}
                                      content={tooltip}
                                      offset={5}
                                      noArrow
                                      place="bottom"
                                      positionStrategy="absolute"
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
                  ),
                )}
                <Controller
                  name="shouldSyncLabelAndName"
                  control={control}
                  defaultValue={
                    objectMetadataItem?.shouldSyncLabelAndName ?? true
                  }
                  render={({ field: { onChange, value } }) => (
                    <SyncObjectLabelAndNameToggle
                      value={value ?? true}
                      onChange={(value) => {
                        onChange(value);
                        if (value === true) {
                          fillNamePluralFromLabelPlural(labelPlural);
                          fillNameSingularFromLabelSingular(labelSingular);
                        }
                      }}
                    />
                  )}
                />
              </StyledAdvancedSettingsSectionInputWrapper>
            </StyledAdvancedSettingsContainer>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
