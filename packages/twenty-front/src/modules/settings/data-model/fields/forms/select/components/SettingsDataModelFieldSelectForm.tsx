import styled from '@emotion/styled';
import { type DropResult } from '@hello-pangea/dnd';
import { Controller, useFormContext } from 'react-hook-form';
import { z } from 'zod';

import { type FieldMetadataItemOption } from '@/object-metadata/types/FieldMetadataItem';
import { selectOptionsSchema } from '@/object-metadata/validation-schemas/selectOptionsSchema';
import { multiSelectFieldDefaultValueSchema } from '@/object-record/record-field/ui/validation-schemas/multiSelectFieldDefaultValueSchema';
import { selectFieldDefaultValueSchema } from '@/object-record/record-field/ui/validation-schemas/selectFieldDefaultValueSchema';
import { useSelectSettingsFormInitialValues } from '@/settings/data-model/fields/forms/select/hooks/useSelectSettingsFormInitialValues';
import { convertBulkTextToOptions } from '@/settings/data-model/fields/forms/select/utils/convertBulkTextToOptions';
import { convertOptionsToBulkText } from '@/settings/data-model/fields/forms/select/utils/convertOptionsToBulkText';
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
import { TextArea } from '@/ui/input/components/TextArea';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { isAdvancedModeEnabledState } from '@/ui/navigation/navigation-drawer/states/isAdvancedModeEnabledState';
import { useRecoilValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilValueV2';
import { useTheme } from '@emotion/react';
import { t } from '@lingui/core/macro';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { isDefined } from 'twenty-shared/utils';
import {
  IconDotsVertical,
  IconPencil,
  IconPlus,
  IconPoint,
  IconTrash,
} from 'twenty-ui/display';
import { LightButton, LightIconButton } from 'twenty-ui/input';
import { CardContent, CardFooter } from 'twenty-ui/layout';
import { MenuItem } from 'twenty-ui/navigation';
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
  isBulkInputMode: boolean;
}>`
  color: ${({ theme }) => theme.font.color.light};
  font-size: ${({ theme }) => theme.font.size.xs};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  margin-bottom: ${({ theme }) => theme.spacing(1.5)};
  margin-top: ${({ theme }) => theme.spacing(1)};
  width: 100%;
  margin-left: ${({ theme, isAdvancedModeEnabled, isBulkInputMode }) =>
    theme.spacing(isAdvancedModeEnabled && !isBulkInputMode ? 10 : 0)};
};
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
  align-items: center;
  display: flex;
  width: 100%;
`;

const StyledIconContainer = styled.div`
  align-items: center;
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

const StyledOptionsHeaderContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacing(1.5)};
  margin-top: ${({ theme }) => theme.spacing(1)};
  width: 100%;
`;

const StyledTextAreaContainer = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing(2)};
`;

const StyledHelpText = styled.div`
  color: ${({ theme }) => theme.font.color.light};
  font-size: ${({ theme }) => theme.font.size.xs};
  margin-top: ${({ theme }) => theme.spacing(1)};
  margin-bottom: ${({ theme }) => theme.spacing(2)};
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

  const isAdvancedModeEnabled = useRecoilValueV2(isAdvancedModeEnabledState);

  const [searchParams] = useSearchParams();

  const {
    control,
    setValue: setFormValue,
    watch: watchFormValue,
    getValues,
  } = useFormContext<SettingsDataModelFieldSelectFormValues>();

  const [hasAppliedNewOption, setHasAppliedNewOption] = useState(false);
  const [isBulkInputMode, setIsBulkInputMode] = useState(false);
  const [bulkInputText, setBulkInputText] = useState('');

  const OPTIONS_DROPDOWN_ID =
    'settings-data-model-field-select-options-dropdown';
  const { closeDropdown: closeOptionsDropdown } = useCloseDropdown();

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
              <StyledOptionsHeaderContainer>
                <StyledLabelContainer>
                  {!isBulkInputMode && (
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
                  )}
                  <StyledOptionsLabel
                    isAdvancedModeEnabled={isAdvancedModeEnabled}
                    isBulkInputMode={isBulkInputMode}
                  >
                    {t`Options`}
                  </StyledOptionsLabel>
                </StyledLabelContainer>
                {!disabled && (
                  <Dropdown
                    dropdownId={OPTIONS_DROPDOWN_ID}
                    clickableComponent={
                      <LightIconButton
                        Icon={IconDotsVertical}
                        accent="tertiary"
                      />
                    }
                    dropdownComponents={
                      <DropdownContent
                        widthInPixels={GenericDropdownContentWidth.Narrow}
                      >
                        <DropdownMenuItemsContainer>
                          <MenuItem
                            text={
                              isBulkInputMode ? t`Single edit` : t`Bulk edit`
                            }
                            LeftIcon={IconPencil}
                            onClick={() => {
                              if (!isBulkInputMode) {
                                setBulkInputText(
                                  convertOptionsToBulkText(options),
                                );
                              }
                              setIsBulkInputMode(
                                (currentInputMode) => !currentInputMode,
                              );
                              closeOptionsDropdown(OPTIONS_DROPDOWN_ID);
                            }}
                          />
                          <MenuItem
                            text={t`Remove all`}
                            accent="danger"
                            LeftIcon={IconTrash}
                            onClick={() => {
                              onChange([]);
                              closeOptionsDropdown(OPTIONS_DROPDOWN_ID);
                            }}
                          />
                        </DropdownMenuItemsContainer>
                      </DropdownContent>
                    }
                  />
                )}
              </StyledOptionsHeaderContainer>

              {isBulkInputMode ? (
                <StyledTextAreaContainer>
                  <TextArea
                    textAreaId="bulk-options-input"
                    placeholder={t`Enter one option per line`}
                    value={bulkInputText}
                    onChange={(nextOptionAsText) => {
                      if (disabled) {
                        return;
                      }

                      const nextOptions = convertBulkTextToOptions(
                        nextOptionAsText,
                        options,
                      );

                      onChange(nextOptions);
                      setBulkInputText(nextOptionAsText);
                    }}
                    minRows={5}
                    maxRows={15}
                    disabled={disabled}
                  />
                  <StyledHelpText>
                    {t`Enter one option per line. Each line will become a new option.`}
                  </StyledHelpText>
                </StyledTextAreaContainer>
              ) : (
                <>
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
                </>
              )}
            </StyledContainer>
            {!disabled && !isBulkInputMode && (
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
