import styled from '@emotion/styled';
import { DropResult } from '@hello-pangea/dnd';
import { Controller, useFormContext } from 'react-hook-form';

import { z } from 'zod';

import { FieldMetadataItemOption } from '@/object-metadata/types/FieldMetadataItem';
import { selectOptionsSchema } from '@/object-metadata/validation-schemas/selectOptionsSchema';
import { multiSelectFieldDefaultValueSchema } from '@/object-record/record-field/validation-schemas/multiSelectFieldDefaultValueSchema';
import { selectFieldDefaultValueSchema } from '@/object-record/record-field/validation-schemas/selectFieldDefaultValueSchema';
import { SettingsServiceCenterSectorFieldSelectFormOptionRow } from '@/settings/service-center/sectors/components/SettingsServiceCenterSectorFieldSelectFormOptionRow';
import { useSelectSettingsFormInitialValues } from '@/settings/service-center/sectors/hooks/useSelectSettingsFormInitialValues';
import { DraggableItem } from '@/ui/layout/draggable-list/components/DraggableItem';
import { DraggableList } from '@/ui/layout/draggable-list/components/DraggableList';
import { IconPlus } from 'twenty-ui/display';
import { LightButton } from 'twenty-ui/input';
import { CardContent, CardFooter } from 'twenty-ui/layout';
import { getNextThemeColor } from 'twenty-ui/theme';
import { v4 } from 'uuid';
import { moveArrayItem } from '~/utils/array/moveArrayItem';
import { toSpliced } from '~/utils/array/toSpliced';

export const settingsServiceCenterSectorTopicFieldSelectFormSchema = z.object({
  defaultValue: selectFieldDefaultValueSchema(),
  topics: selectOptionsSchema,
});

export const settingsDataModelFieldMultiSelectFormSchema = z.object({
  defaultValue: multiSelectFieldDefaultValueSchema(),
  topics: selectOptionsSchema,
});

const selectOrMultiSelectFormSchema = z.union([
  settingsServiceCenterSectorTopicFieldSelectFormSchema,
  settingsDataModelFieldMultiSelectFormSchema,
]);

export type SettingsDataModelFieldSelectFormValues = z.infer<
  typeof selectOrMultiSelectFormSchema
>;

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
  display: flex;
  justify-content: flex-end;
`;

// eslint-disable-next-line @nx/workspace-no-hardcoded-colors
const StyledButton = styled(LightButton)`
  justify-content: center;
  width: 20%;
  background-color: #1960eb;
  color: #fff;
  &:hover {
    background-color: #154bb5;
    color: #fff;
  }
`;

export const SettingsServiceCenterSectorTopicSelect = () => {
  // const { t } = useTranslation();

  const { initialOptions } = useSelectSettingsFormInitialValues();
  const {
    control,
    setValue: setFormValue,
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

  const generateNewSelectOptionLabel = (
    values: Pick<FieldMetadataItemOption, 'label'>[],
    iteration = 1,
  ): string => {
    const newOptionLabel = `Topic ${values.length + iteration}`;
    const labelExists = values.some((value) => value.label === newOptionLabel);

    return labelExists
      ? generateNewSelectOptionLabel(values, iteration + 1)
      : newOptionLabel;
  };

  const generateNewSelectOption = (
    options: FieldMetadataItemOption[],
  ): FieldMetadataItemOption => {
    const newOptionLabel = generateNewSelectOptionLabel(options);

    return {
      color: getNextThemeColor(options[options.length - 1].color),
      id: v4(),
      label: newOptionLabel,
      position: options.length,
      value: newOptionLabel,
    };
  };
  const getOptionsWithNewOption = () => {
    const currentOptions = getValues('topics');

    const newOptions = [
      ...currentOptions,
      generateNewSelectOption(currentOptions),
    ];

    return newOptions;
  };

  const handleAddTopic = () => {
    const newOptions = getOptionsWithNewOption();

    setFormValue('topics', newOptions);
  };

  const handleInputEnter = () => {
    const newOptions = getOptionsWithNewOption();

    setFormValue('topics', newOptions);
  };

  return (
    <>
      <Controller
        name="topics"
        control={control}
        defaultValue={initialOptions}
        render={({ field: { onChange, value: topics } }) => (
          <>
            <StyledContainer>
              <StyledLabel>
                {'Add topics related to this sector below'}
              </StyledLabel>
              <DraggableList
                onDragEnd={(result) => handleDragEnd(topics, result, onChange)}
                draggableItems={
                  <>
                    {topics.map((topic, index) => (
                      <DraggableItem
                        isInsideScrollableContainer
                        key={topic.id}
                        draggableId={topic.id}
                        index={index}
                        isDragDisabled={topics.length === 1}
                        itemComponent={
                          <SettingsServiceCenterSectorFieldSelectFormOptionRow
                            key={topic.id}
                            option={topic}
                            onChange={(nextOption: any) => {
                              const nextOptions = toSpliced(
                                topics,
                                index,
                                1,
                                nextOption,
                              );
                              onChange(nextOptions);
                            }}
                            onRemove={() => {
                              const nextOptions = toSpliced(
                                topics,
                                index,
                                1,
                              ).map((topic, nextOptionIndex) => ({
                                ...topic,
                                position: nextOptionIndex,
                              }));
                              onChange(nextOptions);
                            }}
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
                title="Add topic"
                Icon={IconPlus}
                onClick={handleAddTopic}
              />
            </StyledFooter>
          </>
        )}
      />
    </>
  );
};
