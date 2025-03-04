import { useUpdateOneObjectMetadataItem } from '@/object-metadata/hooks/useUpdateOneObjectMetadataItem';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { AdvancedSettingsWrapper } from '@/settings/components/AdvancedSettingsWrapper';
import { SettingsOptionCardContentToggle } from '@/settings/components/SettingsOptions/SettingsOptionCardContentToggle';
import { OBJECT_NAME_MAXIMUM_LENGTH } from '@/settings/data-model/constants/ObjectNameMaximumLength';
import {
  SettingsDataModelObjectAboutFormValues,
  settingsDataModelObjectAboutFormSchema,
} from '@/settings/data-model/validation-schemas/settingsDataModelObjectAboutFormSchema';
import { settingsUpdateObjectInputSchema } from '@/settings/data-model/validation-schemas/settingsUpdateObjectInputSchema';
import { SettingsPath } from '@/types/SettingsPath';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { IconPicker } from '@/ui/input/components/IconPicker';
import { TextArea } from '@/ui/input/components/TextArea';
import { TextInput } from '@/ui/input/components/TextInput';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLingui } from '@lingui/react/macro';
import pick from 'lodash.pick';
import { plural } from 'pluralize';
import { Controller, useForm } from 'react-hook-form';
import { useSetRecoilState } from 'recoil';
import { isDefined } from 'twenty-shared';
import {
  AppTooltip,
  Card,
  IconInfoCircle,
  IconRefresh,
  TooltipDelay,
} from 'twenty-ui';
import { ZodError, isDirty } from 'zod';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';
import { updatedObjectNamePluralState } from '~/pages/settings/data-model/states/updatedObjectNamePluralState';
import { computeMetadataNameFromLabel } from '~/pages/settings/data-model/utils/compute-metadata-name-from-label.utils';

type SettingsDataModelObjectAboutFormProps = {
  disableEdition?: boolean;
  // TODO upper throw if undefined ? new object settings things should provided default value ?
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
}: SettingsDataModelObjectAboutFormProps) => {
  const navigate = useNavigateSettings();
  const { enqueueSnackBar } = useSnackBar();
  const setUpdatedObjectNamePlural = useSetRecoilState(
    updatedObjectNamePluralState,
  );
  const { updateOneObjectMetadataItem } = useUpdateOneObjectMetadataItem();
  const { control, watch, setValue, formState, reset, handleSubmit } =
    useForm<SettingsDataModelObjectAboutFormValues>({
      mode: 'onTouched',
      resolver: zodResolver(settingsDataModelObjectAboutFormSchema),
    });

  const getUpdatePayload = (
    formValues: SettingsDataModelObjectAboutFormValues,
  ) => {
    let values = formValues;
    const dirtyFieldKeys = Object.keys(
      formState.dirtyFields,
    ) as (keyof SettingsDataModelObjectAboutFormValues)[];
    const shouldComputeNamesFromLabels: boolean = dirtyFieldKeys.includes(
      IS_LABEL_SYNCED_WITH_NAME_LABEL,
    )
      ? (formValues.isLabelSyncedWithName as boolean)
      : isDefined(objectMetadataItem) &&
        objectMetadataItem.isLabelSyncedWithName;

    // OOF
    if (shouldComputeNamesFromLabels) {
      values = {
        ...values,
        ...(values.labelSingular && dirtyFieldKeys.includes('labelSingular')
          ? {
              nameSingular: computeMetadataNameFromLabel(
                formValues.labelSingular,
              ),
            }
          : {}),
        ...(values.labelPlural && dirtyFieldKeys.includes('labelPlural')
          ? {
              namePlural: computeMetadataNameFromLabel(formValues.labelPlural),
            }
          : {}),
      };
    }
    ///

    return settingsUpdateObjectInputSchema.parse(
      pick(values, [
        ...dirtyFieldKeys,
        ...(shouldComputeNamesFromLabels &&
        dirtyFieldKeys.includes('labelPlural')
          ? ['namePlural']
          : []),
        ...(shouldComputeNamesFromLabels &&
        dirtyFieldKeys.includes('labelSingular')
          ? ['nameSingular']
          : []),
      ]),
    );
  };

  const handleSave = async (
    formValues: SettingsDataModelObjectAboutFormValues,
  ) => {
    if (!isDirty) {
      return;
    }
    try {
      console.log(objectMetadataItem);
      const updatePayload = getUpdatePayload(formValues);
      const objectNamePluralForRedirection =
        updatePayload.namePlural ?? objectMetadataItem.namePlural;

      setUpdatedObjectNamePlural(objectNamePluralForRedirection);

      // TODO try with create new object and see if it's working
      await updateOneObjectMetadataItem({
        idToUpdate: objectMetadataItem.id,
        updatePayload,
      });

      reset(undefined, { keepValues: true });

      navigate(SettingsPath.ObjectDetail, {
        objectNamePlural: objectNamePluralForRedirection,
      });
    } catch (error) {
      if (error instanceof ZodError) {
        enqueueSnackBar(error.issues[0].message, {
          variant: SnackBarVariant.Error,
        });
      } else {
        enqueueSnackBar((error as Error).message, {
          variant: SnackBarVariant.Error,
        });
      }
    }
  };

  const { t } = useLingui();

  const theme = useTheme();

  const isLabelSyncedWithName =
    watch(IS_LABEL_SYNCED_WITH_NAME_LABEL) ??
    (isDefined(objectMetadataItem)
      ? objectMetadataItem.isLabelSyncedWithName
      : true);
  // OOF
  const labelSingular = watch('labelSingular');
  const labelPlural = watch('labelPlural');
  watch('nameSingular');
  watch('namePlural');
  watch('description');
  watch('icon');
  ///
  const apiNameTooltipText = isLabelSyncedWithName
    ? t`Deactivate "Synchronize Objects Labels and API Names" to set a custom API name`
    : t`Input must be in camel case and cannot start with a number`;

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
              onBlur={() => handleSubmit(handleSave)()}
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
              label={t`Plural`}
              placeholder={t`Listings`}
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
            placeholder={t`Write a description`}
            minRows={4}
            value={value ?? undefined}
            onChange={(nextValue) => onChange(nextValue ?? null)}
            disabled={disableEdition}
            onBlur={() => handleSubmit(handleSave)()}
          />
        )}
      />
      <StyledAdvancedSettingsOuterContainer>
        <StyledAdvancedSettingsContainer>
          <StyledAdvancedSettingsSectionInputWrapper>
            {[
              {
                label: t`API Name (Singular)`,
                fieldName: 'nameSingular' as const,
                placeholder: `listing`,
                defaultValue: objectMetadataItem?.nameSingular,
                disableEdition: disableEdition || isLabelSyncedWithName,
                tooltip: apiNameTooltipText,
              },
              {
                label: t`API Name (Plural)`,
                fieldName: 'namePlural' as const,
                placeholder: `listings`,
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
                            onBlur={() => handleSubmit(handleSave)()}
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
                        // TO_CHECK prastoin Could be factorized to be scoped to form itself ?
                        handleSubmit(handleSave)();
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
