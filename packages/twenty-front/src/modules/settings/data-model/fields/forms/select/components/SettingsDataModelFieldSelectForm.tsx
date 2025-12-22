import styled from '@emotion/styled';
import { type DropResult } from '@hello-pangea/dnd';
import { Controller, useFormContext } from 'react-hook-form';
import { z } from 'zod';

import { type FieldMetadataItemOption } from '@/object-metadata/types/FieldMetadataItem';
import { selectOptionsSchema } from '@/object-metadata/validation-schemas/selectOptionsSchema';
import { multiSelectFieldDefaultValueSchema } from '@/object-record/record-field/ui/validation-schemas/multiSelectFieldDefaultValueSchema';
import { selectFieldDefaultValueSchema } from '@/object-record/record-field/ui/validation-schemas/selectFieldDefaultValueSchema';
import { useSelectSettingsFormInitialValues } from '@/settings/data-model/fields/forms/select/hooks/useSelectSettingsFormInitialValues';
import { generateNewSelectOption } from '@/settings/data-model/fields/forms/select/utils/generateNewSelectOption';
import { isSelectOptionDefaultValue } from '@/settings/data-model/utils/isSelectOptionDefaultValue';
import { DraggableItem } from '@/ui/layout/draggable-list/components/DraggableItem';
import { DraggableList } from '@/ui/layout/draggable-list/components/DraggableList';
import { FieldMetadataType } from '~/generated-metadata/graphql';
import { moveArrayItem } from '~/utils/array/moveArrayItem';
import { toSpliced } from '~/utils/array/toSpliced';
import { applySimpleQuotesToString } from '~/utils/string/applySimpleQuotesToString';

import { useFieldMetadataItemById } from '@/object-metadata/hooks/useFieldMetadataItemById';
import { AdvancedSettingsWrapper } from '@/settings/components/AdvancedSettingsWrapper';
import { isAdvancedModeEnabledState } from '@/ui/navigation/navigation-drawer/states/isAdvancedModeEnabledState';
import { useTheme } from '@emotion/react';
import { t } from '@lingui/core/macro';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { IconPlus, IconPoint } from 'twenty-ui/display';
import { LightButton } from 'twenty-ui/input';
import { CardContent, CardFooter } from 'twenty-ui/layout';
import { SettingsDataModelFieldSelectFormOptionRow } from './SettingsDataModelFieldSelectFormOptionRow';

export const settingsDataModelFieldSelectFormSchema = z.object({
  defaultValue: selectFieldDefaultValueSchema(),
  options: selectOptionsSchema,
});

export const settingsDataModelFieldMultiSelectFormSchema = z.object({
  defaultValue: multiSelectFieldDefaultValueSchema(),
  options: selectOptionsSchema,
});

export type SettingsDataModelFieldSelectFormValues = z.infer<
  | typeof settingsDataModelFieldSelectFormSchema
  | typeof settingsDataModelFieldMultiSelectFormSchema
>;

type SettingsDataModelFieldSelectFormProps = {
  fieldType: FieldMetadataType.SELECT | FieldMetadataType.MULTI_SELECT;
  existingFieldMetadataId: string;
  disabled?: boolean;
};

const StyledContainer = styled(CardContent)`
  padding-bottom: ${({ theme }) => theme.spacing(3.5)};
`;

const StyledOptionsLabel = styled.div<{
  isAdvancedModeEnabled: boolean;
}>`
  color: ${({ theme }) => theme.font.color.light};
  font-size: ${({ theme }) => theme.font.size.xs};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  margin-bottom: ${({ theme }) => theme.spacing(1.5)};
  margin-top: ${({ theme }) => theme.spacing(1)};
  width: 100%;
  margin-left: ${({ theme, isAdvancedModeEnabled }) =>
    theme.spacing(isAdvancedModeEnabled ? 10 : 0)};
`;

const StyledApiKeyContainer = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  width: 100%;
`;

const StyledApiKey = styled.span`
  color: ${({ theme }) => theme.font.color.light};
  font-size: ${({ theme }) => theme.font.size.xs};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  margin-bottom: ${({ theme }) => theme.spacing(1.5)};
  margin-top: ${({ theme }) => theme.spacing(1)};
  width: 100%;
  white-space: nowrap;
`;

const StyledLabelContainer = styled.div`
  display: flex;
`;

const StyledIconContainer = styled.div`
  border-right: 1px solid ${({ theme }) => theme.color.yellow};
  display: flex;

  margin-bottom: ${({ theme }) => theme.spacing(1.5)};
  margin-top: ${({ theme }) => theme.spacing(1)};
`;

const StyledIconPoint = styled(IconPoint)`
  margin-right: ${({ theme }) => theme.spacing(0.5)};
`;

const StyledFooter = styled(CardFooter)`
  background-color: ${({ theme }) => theme.background.secondary};
  padding: ${({ theme }) => theme.spacing(1)};
`;

const StyledButton = styled(LightButton)`
  justify-content: center;
  width: 100%;
`;

export const SettingsDataModelFieldSelectForm = ({
  existingFieldMetadataId,
  fieldType,
  disabled = false,
}: SettingsDataModelFieldSelectFormProps) => {
  const { initialDefaultValue, initialOptions } =
    useSelectSettingsFormInitialValues({
      fieldMetadataId: existingFieldMetadataId,
    });
  const { fieldMetadataItem } = useFieldMetadataItemById(
    existingFieldMetadataId,
  );
  const isNullable = fieldMetadataItem?.isNullable;

  const isAdvancedModeEnabled = useRecoilValue(isAdvancedModeEnabledState);

  const [searchParams] = useSearchParams();

  const {
    control,
    setValue: setFormValue,
    watch: watchFormValue,
    getValues,
  } = useFormContext<SettingsDataModelFieldSelectFormValues>();

  const [hasAppliedNewOption, setHasAppliedNewOption] = useState(false);

  useEffect(() => {
    const newOptionValue = searchParams.get('newOption');

    if (isDefined(newOptionValue) && !hasAppliedNewOption) {
      const newOption = generateNewSelectOption(initialOptions, newOptionValue);

      const optionsWithNew = [...initialOptions, newOption];

      setFormValue('options', optionsWithNew, { shouldDirty: true });
      setHasAppliedNewOption(true);
    }
  }, [searchParams, hasAppliedNewOption, initialOptions, setFormValue]);

  const handleDragEnd = (
    values: FieldMetadataItemOption[],
    result: DropResult,
    onChange: (options: FieldMetadataItemOption[]) => void,
  ) => {
    if (!result.destination) return;

    const nextOptions = moveArrayItem(values, {
      fromIndex: result.source.index,
      toIndex: result.destination.index,
    }).map((option, index) => ({ ...option, position: index }));

    onChange(nextOptions);
  };

  const isOptionDefaultValue = (
    optionValue: FieldMetadataItemOption['value'],
  ) =>
    isSelectOptionDefaultValue(optionValue, {
      type: fieldType,
      defaultValue: watchFormValue('defaultValue'),
    });

  const handleSetOptionAsDefault = (
    optionValue: FieldMetadataItemOption['value'],
  ) => {
    if (isOptionDefaultValue(optionValue)) return;

    if (fieldType === FieldMetadataType.SELECT) {
      setFormValue('defaultValue', applySimpleQuotesToString(optionValue), {
        shouldDirty: true,
      });
      return;
    }

    const previousDefaultValue = getValues('defaultValue');

    if (
      fieldType === FieldMetadataType.MULTI_SELECT &&
      (Array.isArray(previousDefaultValue) || previousDefaultValue === null)
    ) {
      setFormValue(
        'defaultValue',
        [
          ...(previousDefaultValue ?? []),
          applySimpleQuotesToString(optionValue),
        ],
        { shouldDirty: true },
      );
    }
  };

  const handleRemoveOptionAsDefault = (
    optionValue: FieldMetadataItemOption['value'],
  ) => {
    if (!isOptionDefaultValue(optionValue)) return;

    if (fieldType === FieldMetadataType.SELECT) {
      setFormValue('defaultValue', null, { shouldDirty: true });
      return;
    }

    const previousDefaultValue = getValues('defaultValue');

    if (
      fieldType === FieldMetadataType.MULTI_SELECT &&
      (Array.isArray(previousDefaultValue) || previousDefaultValue === null)
    ) {
      const nextDefaultValue = previousDefaultValue?.filter(
        (value) => value !== applySimpleQuotesToString(optionValue),
      );
      setFormValue(
        'defaultValue',
        nextDefaultValue?.length ? nextDefaultValue : null,
        { shouldDirty: true },
      );
    }
  };

  const getOptionsWithNewOption = () => {
    const currentOptions = getValues('options');

    const newOptions = [
      ...currentOptions,
      generateNewSelectOption(currentOptions),
    ];

    return newOptions;
  };

  const handleAddOption = () => {
    const newOptions = getOptionsWithNewOption();

    setFormValue('options', newOptions, { shouldDirty: true });
  };

  const handleInputEnter = () => {
    const newOptions = getOptionsWithNewOption();

    setFormValue('options', newOptions, { shouldDirty: true });
  };

  const theme = useTheme();

  return (
    <>
      <Controller
        name="defaultValue"
        control={control}
        defaultValue={initialDefaultValue}
        render={() => <></>}
      />
      <Controller
        name="options"
        control={control}
        defaultValue={initialOptions}
        render={({ field: { onChange, value: options } }) => (
          <>
            <StyledContainer>
              <StyledLabelContainer>
                <AdvancedSettingsWrapper animationDimension="width" hideDot>
                  <StyledApiKeyContainer>
                    <StyledIconContainer>
                      <StyledIconPoint
                        size={12}
                        color={theme.color.yellow}
                        fill={theme.color.yellow}
                      />
                    </StyledIconContainer>
                    <StyledApiKey>{t`API values`}</StyledApiKey>
                  </StyledApiKeyContainer>
                </AdvancedSettingsWrapper>
                <StyledOptionsLabel
                  isAdvancedModeEnabled={isAdvancedModeEnabled}
                >
                  {t`Options`}
                </StyledOptionsLabel>
              </StyledLabelContainer>
              <DraggableList
                onDragEnd={(result) =>
                  !disabled
                    ? handleDragEnd(options, result, onChange)
                    : undefined
                }
                draggableItems={
                  <>
                    {options.map((option, index) => (
                      <DraggableItem
                        isInsideScrollableContainer
                        key={option.id}
                        draggableId={option.id}
                        index={index}
                        isDragDisabled={options.length === 1}
                        itemComponent={
                          <SettingsDataModelFieldSelectFormOptionRow
                            key={option.id}
                            option={option}
                            isNewRow={index === options.length - 1}
                            onChange={(nextOption) => {
                              if (disabled) {
                                return;
                              }
                              const nextOptions = toSpliced(
                                options,
                                index,
                                1,
                                nextOption,
                              );
                              onChange(nextOptions);

                              // Update option value in defaultValue if value has changed
                              if (
                                nextOption.value !== option.value &&
                                isOptionDefaultValue(option.value)
                              ) {
                                handleRemoveOptionAsDefault(option.value);
                                handleSetOptionAsDefault(nextOption.value);
                              }
                            }}
                            onRemove={() => {
                              if (disabled) {
                                return;
                              }
                              const nextOptions = toSpliced(
                                options,
                                index,
                                1,
                              ).map((option, nextOptionIndex) => ({
                                ...option,
                                position: nextOptionIndex,
                              }));
                              onChange(nextOptions);
                            }}
                            isDefault={isOptionDefaultValue(option.value)}
                            fieldIsNullable={!!isNullable}
                            onSetAsDefault={() => {
                              if (disabled) {
                                return;
                              }
                              handleSetOptionAsDefault(option.value);
                            }}
                            onRemoveAsDefault={() => {
                              if (disabled) {
                                return;
                              }
                              handleRemoveOptionAsDefault(option.value);
                            }}
                            onInputEnter={() => {
                              if (disabled) {
                                return;
                              }
                              handleInputEnter();
                            }}
                          />
                        }
                      />
                    ))}
                  </>
                }
              />
            </StyledContainer>
            {!disabled && (
              <StyledFooter>
                <StyledButton
                  title={t`Add option`}
                  Icon={IconPlus}
                  onClick={handleAddOption}
                />
              </StyledFooter>
            )}
          </>
        )}
      />
    </>
  );
};
