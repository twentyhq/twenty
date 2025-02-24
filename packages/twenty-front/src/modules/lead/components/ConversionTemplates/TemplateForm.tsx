import { useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import styled from '@emotion/styled';

import { TextInput } from '@/ui/input/components/TextInput';
import { Button } from '@/ui/button/components/Button';
import { Toggle } from '@/ui/input/components/Toggle';
import { Select } from '@/ui/input/components/Select';
import { Textarea } from '@/ui/input/components/Textarea';

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
  sourceLeadType: string;
  targetObjectType: string;
  fieldMappingRules: any[];
  conversionSettings: {
    keepOriginalLead: boolean;
    createRelations: boolean;
    markAsConverted: boolean;
  };
  isDefault?: boolean;
}

interface TemplateFormProps {
  initialData?: TemplateFormData;
  availableObjects: Array<{ value: string; label: string }>;
  onSubmit: (data: TemplateFormData) => void;
  onCancel: () => void;
}

export const TemplateForm = ({
  initialData,
  availableObjects,
  onSubmit,
  onCancel,
}: TemplateFormProps) => {
  const { control, handleSubmit } = useForm<TemplateFormData>({
    defaultValues: initialData || {
      name: '',
      description: '',
      sourceLeadType: 'lead',
      targetObjectType: '',
      fieldMappingRules: [],
      conversionSettings: {
        keepOriginalLead: false,
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
        <StyledSectionTitle>Target Object</StyledSectionTitle>
        <Controller
          name="targetObjectType"
          control={control}
          rules={{ required: true }}
          render={({ field }) => (
            <Select
              label="Convert To"
              options={availableObjects}
              fullWidth
              {...field}
            />
          )}
        />
      </StyledSection>

      <StyledSection>
        <StyledSectionTitle>Conversion Settings</StyledSectionTitle>
        <Controller
          name="conversionSettings.keepOriginalLead"
          control={control}
          render={({ field: { value, onChange } }) => (
            <Toggle
              label="Keep Original Lead"
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
