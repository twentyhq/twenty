import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { objectMetadataItemSchema } from '@/object-metadata/validation-schemas/objectMetadataItemSchema';
import { AdvancedSettingsWrapper } from '@/settings/components/AdvancedSettingsWrapper';
import { SettingsOptionCardContentToggle } from '@/settings/components/SettingsOptions/SettingsOptionCardContentToggle';
import { OBJECT_NAME_MAXIMUM_LENGTH } from '@/settings/data-model/constants/ObjectNameMaximumLength';
import { IconPicker } from '@/ui/input/components/IconPicker';
import { TextArea } from '@/ui/input/components/TextArea';
import { TextInput } from '@/ui/input/components/TextInput';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { plural } from 'pluralize';
import { Controller, useFormContext } from 'react-hook-form';
import {
  AppTooltip,
  Card,
  IconInfoCircle,
  IconRefresh,
  TooltipDelay,
} from 'twenty-ui';
import { z } from 'zod';
import { computeMetadataNameFromLabel } from '~/pages/settings/data-model/utils/compute-metadata-name-from-label.utils';
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
        isLabelSyncedWithName: true,
      })
      .partial(),
  );

type SettingsDataModelObjectAboutFormValues = z.infer<
  typeof settingsDataModelObjectAboutFormSchema
>;

type SettingsDataModelObjectAboutFormProps = {
  disableEdition?: boolean;
  objectMetadataItem?: ObjectMetadataItem;
  onBlur?: () => void;
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
  disableEdition,
  objectMetadataItem,
  onBlur,
}: SettingsDataModelObjectAboutFormProps) => {
  const { control, watch, setValue } =
    useFormContext<SettingsDataModelObjectAboutFormValues>();
  const theme = useTheme();

  const isLabelSyncedWithName =
    watch(IS_LABEL_SYNCED_WITH_NAME_LABEL) ??
    (isDefined(objectMetadataItem)
      ? objectMetadataItem.isLabelSyncedWithName
      : true);
  const labelSingular = watch('labelSingular');
  const labelPlural = watch('labelPlural');
  watch('nameSingular');
  watch('namePlural');
  watch('description');
  watch('icon');
  const apiNameTooltipText = isLabelSyncedWithName
    ? 'Deactivate "Synchronize Objects Labels and API Names" to set a custom API name'
    : 'Input must be in camel case and cannot start with a number';

  const fillLabelPlural = (labelSingular: string) => {
    const newLabelPluralValue = isDefined(labelSingular)
      ? plural(labelSingular)
      : '';
    setValue('labelPlural', newLabelPluralValue, {
      shouldDirty: isDefined(labelSingular) ? true : false,
    });
    if (isLabelSyncedWithName === true) {
      fillNamePluralFromLabelPlural(newLabelPluralValue);
    }
  };

  const fillNameSingularFromLabelSingular = (labelSingular: string) => {
    isDefined(labelSingular) &&
      setValue('nameSingular', computeMetadataNameFromLabel(labelSingular), {
        shouldDirty: true,
      });
  };

  const fillNamePluralFromLabelPlural = (labelPlural: string) => {
    isDefined(labelPlural) &&
      setValue('namePlural', computeMetadataNameFromLabel(labelPlural), {
        shouldDirty: true,
      });
  };

  return (
    <>
      <StyledInputsContainer>
        <StyledInputContainer>
          <StyledLabel>Icon</StyledLabel>
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
                  onBlur?.();
                }}
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
                if (isLabelSyncedWithName === true) {
                  fillNameSingularFromLabelSingular(value);
                }
              }}
              onBlur={onBlur}
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
          defaultValue={objectMetadataItem?.labelPlural}
          render={({ field: { onChange, value } }) => (
            <TextInput
              label={'Plural'}
              placeholder={'Listings'}
              value={value}
              onChange={(value) => {
                onChange(value);
                if (isLabelSyncedWithName === true) {
                  fillNamePluralFromLabelPlural(value);
                }
              }}
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
        defaultValue={objectMetadataItem?.description ?? null}
        render={({ field: { onChange, value } }) => (
          <TextArea
            placeholder="Write a description"
            minRows={4}
            value={value ?? undefined}
            onChange={(nextValue) => onChange(nextValue ?? null)}
            disabled={disableEdition}
          />
        )}
      />
      <StyledAdvancedSettingsOuterContainer>
        <StyledAdvancedSettingsContainer>
          <StyledAdvancedSettingsSectionInputWrapper>
            {[
              {
                label: 'API Name (Singular)',
                fieldName: 'nameSingular' as const,
                placeholder: 'listing',
                defaultValue: objectMetadataItem?.nameSingular,
                disableEdition: disableEdition || isLabelSyncedWithName,
                tooltip: apiNameTooltipText,
              },
              {
                label: 'API Name (Plural)',
                fieldName: 'namePlural' as const,
                placeholder: 'listings',
                defaultValue: objectMetadataItem?.namePlural,
                disableEdition: disableEdition || isLabelSyncedWithName,
                tooltip: apiNameTooltipText,
              },
            ].map(
              ({
                defaultValue,
                fieldName,
                label,
                placeholder,
                disableEdition,
                tooltip,
              }) => (
                <AdvancedSettingsWrapper key={`object-${fieldName}-text-input`}>
                  <StyledInputContainer>
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
                            disabled={disableEdition}
                            fullWidth
                            maxLength={OBJECT_NAME_MAXIMUM_LENGTH}
                            onBlur={onBlur}
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
                defaultValue={objectMetadataItem?.isLabelSyncedWithName ?? true}
                render={({ field: { onChange, value } }) => (
                  <Card rounded>
                    <SettingsOptionCardContentToggle
                      Icon={IconRefresh}
                      title="Synchronize Objects Labels and API Names"
                      description="Should changing an object's label also change the API?"
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
                        onBlur?.();
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
