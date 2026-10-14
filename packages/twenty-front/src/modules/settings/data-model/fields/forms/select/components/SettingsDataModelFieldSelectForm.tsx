import { styled } from '@linaria/react';
import { type DraggableListDropResult } from '@/ui/layout/draggable-list/types/DraggableListDropResult';
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
import { computeOptionValueFromLabel } from '@/object-metadata/utils/computeOptionValueFromLabel';
import { TextArea } from '@/ui/input/components/TextArea';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { t } from '@lingui/core/macro';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { isDefined } from 'twenty-shared/utils';
import { LightButton, LightIconButton } from 'twenty-ui/components/input';
import { Dropdown } from 'twenty-ui/components/navigation';
import {
  IconApi,
  IconDotsVertical,
  IconPencil,
  IconPlus,
  IconTrash,
} from 'twenty-ui/icon';

import { Collapsible } from 'twenty-ui/primitives/layout';
import { Card } from 'twenty-ui/primitives/surfaces';
import { themeCssVariables } from 'twenty-ui/theme';
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

const StyledOptionsLabel = styled.div<{
  isApiValuesVisible: boolean;
  isBulkInputMode: boolean;
}>`
  color: ${themeCssVariables.font.color.light};
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  margin-bottom: ${themeCssVariables.spacing['1.5']};
  margin-left: ${({ isApiValuesVisible, isBulkInputMode }) =>
    isApiValuesVisible && !isBulkInputMode
      ? themeCssVariables.spacing[10]
      : themeCssVariables.spacing[0]};
  margin-top: ${themeCssVariables.spacing[1]};
  width: 100%;
`;

const StyledApiValuesLabel = styled.span`
  color: ${themeCssVariables.font.color.light};
  display: block;
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  margin-bottom: ${themeCssVariables.spacing['1.5']};
  margin-top: ${themeCssVariables.spacing[1]};
  padding-left: ${themeCssVariables.spacing[5]};
  white-space: nowrap;
`;

const StyledLabelContainer = styled.div`
  align-items: center;
  display: flex;
  width: 100%;
`;

const StyledFooter = styled(Card.Footer)`
  background-color: ${themeCssVariables.background.secondary};
  padding: ${themeCssVariables.spacing[1]};
`;

const StyledOptionsHeaderContainer = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
  margin-bottom: ${themeCssVariables.spacing['1.5']};
  margin-top: ${themeCssVariables.spacing[1]};
  width: 100%;
`;

const StyledTextAreaContainer = styled.div`
  margin-bottom: ${themeCssVariables.spacing[2]};
`;

const StyledHelpText = styled.div`
  color: ${themeCssVariables.font.color.light};
  font-size: ${themeCssVariables.font.size.xs};
  margin-bottom: ${themeCssVariables.spacing[2]};
  margin-top: ${themeCssVariables.spacing[1]};
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
  const [isApiValuesVisible, setIsApiValuesVisible] = useState(() =>
    initialOptions.some(
      (option) => option.value !== computeOptionValueFromLabel(option.label),
    ),
  );

  const OPTIONS_DROPDOWN_ID =
    'settings-data-model-field-select-options-dropdown';

  useEffect(() => {
    const newOptionValue = searchParams.get('newOption');

    if (isDefined(newOptionValue) && !hasAppliedNewOption) {
      const newOption = generateNewSelectOption(initialOptions, newOptionValue);

      const optionsWithNew = [...initialOptions, newOption];

      setFormValue('options', optionsWithNew, {
        shouldDirty: true,
        shouldValidate: true,
      });
      setHasAppliedNewOption(true);
    }
  }, [searchParams, hasAppliedNewOption, initialOptions, setFormValue]);

  const handleDragEnd = (
    values: FieldMetadataItemOption[],
    result: DraggableListDropResult,
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

    setFormValue('options', newOptions, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const handleInputEnter = () => {
    const newOptions = getOptionsWithNewOption();

    setFormValue('options', newOptions, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

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
            <Card.Content>
              <StyledOptionsHeaderContainer>
                <StyledLabelContainer>
                  <Collapsible.Root
                    open={isApiValuesVisible && !isBulkInputMode}
                  >
                    <Collapsible.Panel
                      dimension="width"
                      containAnimation={false}
                    >
                      <StyledApiValuesLabel>{t`API values`}</StyledApiValuesLabel>
                    </Collapsible.Panel>
                  </Collapsible.Root>
                  <StyledOptionsLabel
                    isApiValuesVisible={isApiValuesVisible}
                    isBulkInputMode={isBulkInputMode}
                  >
                    {t`Options`}
                  </StyledOptionsLabel>
                </StyledLabelContainer>
                {!disabled && (
                  <DropdownRoot dropdownId={OPTIONS_DROPDOWN_ID} type="menu">
                    <Dropdown.Trigger
                      render={
                        <LightIconButton
                          emphasis="subtle"
                          aria-label={t`More options`}
                        >
                          <IconDotsVertical />
                        </LightIconButton>
                      }
                    />
                    <DropdownContent
                      width={GenericDropdownContentWidth.Narrow}
                      align="end"
                    >
                      <Dropdown.Section>
                        <Dropdown.ActionItem
                          startIcon={<IconPencil />}
                          onClick={() => {
                            if (!isBulkInputMode) {
                              setBulkInputText(
                                convertOptionsToBulkText(options),
                              );
                            }
                            setIsBulkInputMode(
                              (currentInputMode) => !currentInputMode,
                            );
                          }}
                        >
                          {isBulkInputMode ? t`Single edit` : t`Bulk edit`}
                        </Dropdown.ActionItem>
                        {!isBulkInputMode && (
                          <Dropdown.ActionItem
                            startIcon={<IconApi />}
                            onClick={() =>
                              setIsApiValuesVisible(
                                (currentIsApiValuesVisible) =>
                                  !currentIsApiValuesVisible,
                              )
                            }
                          >
                            {isApiValuesVisible
                              ? t`Hide API values`
                              : t`Show API values`}
                          </Dropdown.ActionItem>
                        )}
                        <Dropdown.ActionItem
                          color="danger"
                          startIcon={<IconTrash />}
                          onClick={() => onChange([])}
                        >{t`Remove all`}</Dropdown.ActionItem>
                      </Dropdown.Section>
                    </DropdownContent>
                  </DropdownRoot>
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
                            key={option.id}
                            draggableId={option.id}
                            index={index}
                            itemComponent={
                              <SettingsDataModelFieldSelectFormOptionRow
                                key={option.id}
                                option={option}
                                isNewRow={index === options.length - 1}
                                isApiValueVisible={isApiValuesVisible}
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
            </Card.Content>
            {!disabled && !isBulkInputMode && (
              <StyledFooter>
                <LightButton
                  startIcon={<IconPlus />}
                  fullWidth
                  onClick={handleAddOption}
                >{t`Add option`}</LightButton>
              </StyledFooter>
            )}
          </>
        )}
      />
    </>
  );
};
