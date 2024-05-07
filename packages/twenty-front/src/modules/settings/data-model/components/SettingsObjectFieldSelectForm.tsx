import { Controller, useFormContext } from 'react-hook-form';
import styled from '@emotion/styled';
import { DropResult } from '@hello-pangea/dnd';
import { IconPlus } from 'twenty-ui';
import { v4 } from 'uuid';
import { z } from 'zod';

import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { SettingsObjectFieldSelectFormOption } from '@/settings/data-model/types/SettingsObjectFieldSelectFormOption';
import { LightButton } from '@/ui/input/button/components/LightButton';
import { CardContent } from '@/ui/layout/card/components/CardContent';
import { CardFooter } from '@/ui/layout/card/components/CardFooter';
import { DraggableItem } from '@/ui/layout/draggable-list/components/DraggableItem';
import { DraggableList } from '@/ui/layout/draggable-list/components/DraggableList';
import {
  MAIN_COLOR_NAMES,
  ThemeColor,
} from '@/ui/theme/constants/MainColorNames';
import { themeColorSchema } from '@/ui/theme/utils/themeColorSchema';
import { moveArrayItem } from '~/utils/array/moveArrayItem';

import { SettingsObjectFieldSelectFormOptionRow } from './SettingsObjectFieldSelectFormOptionRow';

// TODO: rename to SettingsDataModelFieldSelectForm and move to settings/data-model/fields/forms/components

export const settingsDataModelFieldSelectFormSchema = z.object({
  options: z
    .array(
      z.object({
        color: themeColorSchema,
        value: z.string(),
        isDefault: z.boolean().optional(),
        label: z.string().min(1),
      }),
    )
    .min(1),
});

export type SettingsDataModelFieldSelectFormValues = z.infer<
  typeof settingsDataModelFieldSelectFormSchema
>;

type SettingsDataModelFieldSelectFormProps = {
  fieldMetadataItem?: Pick<FieldMetadataItem, 'defaultValue' | 'options'>;
  isMultiSelect?: boolean;
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

const getNextColor = (currentColor: ThemeColor) => {
  const currentColorIndex = MAIN_COLOR_NAMES.findIndex(
    (color) => color === currentColor,
  );
  const nextColorIndex = (currentColorIndex + 1) % MAIN_COLOR_NAMES.length;
  return MAIN_COLOR_NAMES[nextColorIndex];
};

const getDefaultValueOptionIndexes = (
  fieldMetadataItem?: Pick<FieldMetadataItem, 'defaultValue' | 'options'>,
) =>
  fieldMetadataItem?.options?.reduce<number[]>((result, option, index) => {
    if (
      Array.isArray(fieldMetadataItem?.defaultValue) &&
      fieldMetadataItem?.defaultValue.includes(`'${option.value}'`)
    ) {
      return [...result, index];
    }

    // Ensure default value is unique for simple Select field
    if (
      !result.length &&
      fieldMetadataItem?.defaultValue === `'${option.value}'`
    ) {
      return [index];
    }

    return result;
  }, []);

const DEFAULT_OPTION: SettingsObjectFieldSelectFormOption = {
  color: 'green',
  label: 'Option 1',
  value: v4(),
};

export const SettingsDataModelFieldSelectForm = ({
  fieldMetadataItem,
  isMultiSelect = false,
}: SettingsDataModelFieldSelectFormProps) => {
  const { control } = useFormContext<SettingsDataModelFieldSelectFormValues>();

  const initialDefaultValueOptionIndexes =
    getDefaultValueOptionIndexes(fieldMetadataItem);

  const initialValue = fieldMetadataItem?.options
    ?.map((option, index) => ({
      ...option,
      isDefault: initialDefaultValueOptionIndexes?.includes(index),
    }))
    .sort((optionA, optionB) => optionA.position - optionB.position);

  const handleDragEnd = (
    values: SettingsObjectFieldSelectFormOption[],
    result: DropResult,
    onChange: (options: SettingsObjectFieldSelectFormOption[]) => void,
  ) => {
    if (!result.destination) return;

    const nextOptions = moveArrayItem(values, {
      fromIndex: result.source.index,
      toIndex: result.destination.index,
    });

    onChange(nextOptions);
  };

  const findNewLabel = (values: SettingsObjectFieldSelectFormOption[]) => {
    let optionIndex = values.length + 1;
    while (optionIndex < 100) {
      const newLabel = `Option ${optionIndex}`;
      if (!values.map((value) => value.label).includes(newLabel)) {
        return newLabel;
      }
      optionIndex += 1;
    }
    return `Option 100`;
  };

  return (
    <Controller
      name="options"
      control={control}
      defaultValue={initialValue?.length ? initialValue : [DEFAULT_OPTION]}
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
                      key={option.value}
                      draggableId={option.value}
                      index={index}
                      isDragDisabled={options.length === 1}
                      itemComponent={
                        <SettingsObjectFieldSelectFormOptionRow
                          key={option.value}
                          isDefault={option.isDefault}
                          onChange={(nextOption) => {
                            const nextOptions =
                              isMultiSelect || !nextOption.isDefault
                                ? [...options]
                                : // Reset simple Select default option before setting the new one
                                  options.map<SettingsObjectFieldSelectFormOption>(
                                    (value) => ({ ...value, isDefault: false }),
                                  );
                            nextOptions.splice(index, 1, nextOption);
                            onChange(nextOptions);
                          }}
                          onRemove={
                            options.length > 1
                              ? () => {
                                  const nextOptions = [...options];
                                  nextOptions.splice(index, 1);
                                  onChange(nextOptions);
                                }
                              : undefined
                          }
                          option={option}
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
              onClick={() =>
                onChange([
                  ...options,
                  {
                    color: getNextColor(options[options.length - 1].color),
                    label: findNewLabel(options),
                    value: v4(),
                  },
                ])
              }
            />
          </StyledFooter>
        </>
      )}
    />
  );
};
