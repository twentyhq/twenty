import styled from '@emotion/styled';
import { DropResult } from '@hello-pangea/dnd';
import { Controller, useFormContext } from 'react-hook-form';
import { IconPlus } from 'twenty-ui';
import { z } from 'zod';

import {
  FieldMetadataItem,
  FieldMetadataItemOption,
} from '@/object-metadata/types/FieldMetadataItem';
import { selectOptionsSchema } from '@/object-metadata/validation-schemas/selectOptionsSchema';
import { multiSelectFieldDefaultValueSchema } from '@/object-record/record-field/validation-schemas/multiSelectFieldDefaultValueSchema';
import { selectFieldDefaultValueSchema } from '@/object-record/record-field/validation-schemas/selectFieldDefaultValueSchema';
import { useSelectSettingsFormInitialValues } from '@/settings/data-model/fields/forms/select/hooks/useSelectSettingsFormInitialValues';
import { generateNewSelectOption } from '@/settings/data-model/fields/forms/select/utils/generateNewSelectOption';
import { isSelectOptionDefaultValue } from '@/settings/data-model/utils/isSelectOptionDefaultValue';
import { LightButton } from '@/ui/input/button/components/LightButton';
import { CardContent } from '@/ui/layout/card/components/CardContent';
import { CardFooter } from '@/ui/layout/card/components/CardFooter';
import { DraggableItem } from '@/ui/layout/draggable-list/components/DraggableItem';
import { DraggableList } from '@/ui/layout/draggable-list/components/DraggableList';
import { FieldMetadataType } from '~/generated-metadata/graphql';
import { moveArrayItem } from '~/utils/array/moveArrayItem';
import { toSpliced } from '~/utils/array/toSpliced';
import { applySimpleQuotesToString } from '~/utils/string/applySimpleQuotesToString';

import { SettingsDataModelFieldSelectFormOptionRow } from './SettingsDataModelFieldSelectFormOptionRow';

export const settingsDataModelFieldSelectFormSchema = z.object({
  defaultValue: selectFieldDefaultValueSchema(),
  options: selectOptionsSchema,
});

export const settingsDataModelFieldMultiSelectFormSchema = z.object({
  defaultValue: multiSelectFieldDefaultValueSchema(),
  options: selectOptionsSchema,
});

const selectOrMultiSelectFormSchema = z.union([
  settingsDataModelFieldSelectFormSchema,
  settingsDataModelFieldMultiSelectFormSchema,
]);

export type SettingsDataModelFieldSelectFormValues = z.infer<
  typeof selectOrMultiSelectFormSchema
>;

type SettingsDataModelFieldSelectFormProps = {
  fieldMetadataItem: Pick<
    FieldMetadataItem,
    'defaultValue' | 'options' | 'type'
  >;
};

const StyledContainer = styled(CardContent)`
  padding-bottom: ${({ theme }) => theme.spacing(3.5)};
`;

const StyledLabel = styled.span`
  color: ${({ theme }) => theme.font.color.light};
  display: block;
  font-size: ${({ theme }) => theme.font.size.xs};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  margin-bottom: 6px;
  margin-top: ${({ theme }) => theme.spacing(1)};
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
  fieldMetadataItem,
}: SettingsDataModelFieldSelectFormProps) => {
  const { initialDefaultValue, initialOptions } =
    useSelectSettingsFormInitialValues({ fieldMetadataItem });

  const {
    control,
    setValue: setFormValue,
    watch: watchFormValue,
    getValues,
  } = useFormContext<SettingsDataModelFieldSelectFormValues>();

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
      type: fieldMetadataItem.type,
      defaultValue: watchFormValue('defaultValue'),
    });

  const handleSetOptionAsDefault = (
    optionValue: FieldMetadataItemOption['value'],
  ) => {
    if (isOptionDefaultValue(optionValue)) return;

    if (fieldMetadataItem.type === FieldMetadataType.Select) {
      setFormValue('defaultValue', applySimpleQuotesToString(optionValue), {
        shouldDirty: true,
      });
      return;
    }

    const previousDefaultValue = getValues('defaultValue');

    if (
      fieldMetadataItem.type === FieldMetadataType.MultiSelect &&
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

    if (fieldMetadataItem.type === FieldMetadataType.Select) {
      setFormValue('defaultValue', null, { shouldDirty: true });
      return;
    }

    const previousDefaultValue = getValues('defaultValue');

    if (
      fieldMetadataItem.type === FieldMetadataType.MultiSelect &&
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

    setFormValue('options', newOptions);
  };

  const handleInputEnter = () => {
    const newOptions = getOptionsWithNewOption();

    setFormValue('options', newOptions);
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
            <StyledContainer>
              <StyledLabel>Options</StyledLabel>
              <DraggableList
                onDragEnd={(result) => handleDragEnd(options, result, onChange)}
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
                            onSetAsDefault={() =>
                              handleSetOptionAsDefault(option.value)
                            }
                            onRemoveAsDefault={() =>
                              handleRemoveOptionAsDefault(option.value)
                            }
                            onInputEnter={handleInputEnter}
                          />
                        }
                      />
                    ))}
                  </>
                }
              />
            </StyledContainer>
            <StyledFooter>
              <StyledButton
                title="Add option"
                Icon={IconPlus}
                onClick={handleAddOption}
              />
            </StyledFooter>
          </>
        )}
      />
    </>
  );
};
