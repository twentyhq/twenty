import { useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import styled from '@emotion/styled';

import { TextInput } from '@/ui/input/components/TextInput';
import { Button } from '@/ui/button/components/Button';
import { Toggle } from '@/ui/input/components/Toggle';
import { Select } from '@/ui/input/components/Select';
import { Textarea } from '@/ui/input/components/Textarea';

import { FieldMappingSection } from './FieldMappingSection';

const StyledForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};
`;

const StyledSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledSectionTitle = styled.div`
  font-weight: ${({ theme }) => theme.font.weight.medium};
  margin-bottom: ${({ theme }) => theme.spacing(1)};
`;

const StyledButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: ${({ theme }) => theme.spacing(2)};
`;

interface TemplateFormData {
  name: string;
  description?: string;
  sourceObjectMetadataId: string;
  targetObjectMetadataId: string;
  fieldMappingRules: any[];
  conversionSettings: {
    keepOriginalObject: boolean;
    createRelations: boolean;
    markAsConverted: boolean;
  };
  matchingRules?: any[];
  isDefault?: boolean;
}

interface TemplateFormProps {
  initialData?: TemplateFormData;
  availableObjects: Array<{ value: string; label: string }>;
  sourceFields: Array<{ value: string; label: string; type: string }>;
  targetFields: Array<{ value: string; label: string; type: string }>;
  onSubmit: (data: TemplateFormData) => void;
  onCancel: () => void;
  onTargetObjectChange: (objectId: string) => void;
}

export const TemplateForm = ({
  initialData,
  availableObjects,
  sourceFields,
  targetFields,
  onSubmit,
  onCancel,
  onTargetObjectChange,
}: TemplateFormProps) => {
  const { control, handleSubmit, watch } = useForm<TemplateFormData>({
    defaultValues: initialData || {
      name: '',
      description: '',
      sourceObjectMetadataId: '',
      targetObjectMetadataId: '',
      fieldMappingRules: [],
      conversionSettings: {
        keepOriginalObject: false,
        createRelations: true,
        markAsConverted: true,
      },
      isDefault: false,
    },
  });

  const onFormSubmit = useCallback(
    (data: TemplateFormData) => {
      onSubmit(data);
    },
    [onSubmit],
  );

  const handleTargetObjectChange = useCallback(
    (value: string) => {
      onTargetObjectChange(value);
    },
    [onTargetObjectChange],
  );

  return (
    <StyledForm onSubmit={handleSubmit(onFormSubmit)}>
      <StyledSection>
        <StyledSectionTitle>Basic Information</StyledSectionTitle>
        <Controller
          name="name"
          control={control}
          rules={{ required: true }}
          render={({ field }) => (
            <TextInput
              label="Template Name"
              placeholder="Enter template name"
              fullWidth
              {...field}
            />
          )}
        />
        <Controller
          name="description"
          control={control}
          render={({ field }) => (
            <Textarea
              label="Description"
              placeholder="Enter template description"
              rows={3}
              {...field}
            />
          )}
        />
      </StyledSection>

      <StyledSection>
        <StyledSectionTitle>Object Types</StyledSectionTitle>
        <Controller
          name="targetObjectMetadataId"
          control={control}
          rules={{ required: true }}
          render={({ field }) => (
            <Select
              label="Target Object"
              options={availableObjects}
              fullWidth
              {...field}
              onChange={(value) => {
                field.onChange(value);
                handleTargetObjectChange(value);
              }}
            />
          )}
        />
      </StyledSection>

      <StyledSection>
        <StyledSectionTitle>Field Mapping</StyledSectionTitle>
        <Controller
          name="fieldMappingRules"
          control={control}
          render={({ field: { value, onChange } }) => (
            <FieldMappingSection
              sourceFields={sourceFields}
              targetFields={targetFields}
              mappings={value}
              onChange={onChange}
            />
          )}
        />
      </StyledSection>

      <StyledSection>
        <StyledSectionTitle>Conversion Settings</StyledSectionTitle>
        <Controller
          name="conversionSettings.keepOriginalObject"
          control={control}
          render={({ field: { value, onChange } }) => (
            <Toggle
              label="Keep Original Object"
              value={value}
              onChange={onChange}
            />
          )}
        />
        <Controller
          name="conversionSettings.createRelations"
          control={control}
          render={({ field: { value, onChange } }) => (
            <Toggle
              label="Create Relations"
              value={value}
              onChange={onChange}
            />
          )}
        />
        <Controller
          name="conversionSettings.markAsConverted"
          control={control}
          render={({ field: { value, onChange } }) => (
            <Toggle
              label="Mark as Converted"
              value={value}
              onChange={onChange}
            />
          )}
        />
      </StyledSection>

      <StyledSection>
        <Controller
          name="isDefault"
          control={control}
          render={({ field: { value, onChange } }) => (
            <Toggle
              label="Set as Default Template"
              value={value}
              onChange={onChange}
            />
          )}
        />
      </StyledSection>

      <StyledButtonContainer>
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Save Template</Button>
      </StyledButtonContainer>
    </StyledForm>
  );
};
