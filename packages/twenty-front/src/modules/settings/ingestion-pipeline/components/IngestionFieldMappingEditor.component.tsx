import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { IconPlus, IconTrash } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { TextInput } from '@/ui/input/components/TextInput';

import { type IngestionFieldMapping } from '@/settings/ingestion-pipeline/types/ingestion-pipeline.types';

type IngestionFieldMappingEditorProps = {
  pipelineId: string;
  targetObjectNameSingular: string;
  mappings: IngestionFieldMapping[];
  onSaveMappings: (
    inputs: Omit<IngestionFieldMapping, 'id'>[],
  ) => Promise<IngestionFieldMapping[]>;
  onUpdateMapping: (
    id: string,
    update: Partial<Omit<IngestionFieldMapping, 'id' | 'pipelineId'>>,
  ) => Promise<IngestionFieldMapping>;
  onDeleteMapping: (id: string) => Promise<void>;
};

type LocalMapping = {
  tempId: string;
  sourceFieldPath: string;
  targetFieldName: string;
  targetCompositeSubField: string;
  relationTargetObjectName: string;
  relationMatchFieldName: string;
  relationAutoCreate: boolean;
};

const StyledTable = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
`;

const StyledRow = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledFieldCell = styled.div`
  flex: 1;
`;

const StyledArrow = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.lg};
  padding: 0 ${themeCssVariables.spacing[1]};
`;

const StyledDeleteButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: ${themeCssVariables.spacing[1]};
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  align-items: center;

  &:hover {
    color: ${themeCssVariables.color.red};
  }
`;

const StyledHeader = styled(StyledRow)`
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.medium};
  padding-bottom: ${themeCssVariables.spacing[1]};
`;

const StyledButtonRow = styled.div`
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  padding-top: ${themeCssVariables.spacing[2]};
`;

let tempIdCounter = 0;

const createTempId = (): string => {
  tempIdCounter++;

  return `temp-${tempIdCounter}`;
};

export const IngestionFieldMappingEditor = ({
  pipelineId,
  mappings,
  onSaveMappings,
  onUpdateMapping,
  onDeleteMapping,
}: IngestionFieldMappingEditorProps) => {
  const { t } = useLingui();
  const [newMappings, setNewMappings] = useState<LocalMapping[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const addRow = () => {
    setNewMappings([
      ...newMappings,
      {
        tempId: createTempId(),
        sourceFieldPath: '',
        targetFieldName: '',
        targetCompositeSubField: '',
        relationTargetObjectName: '',
        relationMatchFieldName: '',
        relationAutoCreate: false,
      },
    ]);
  };

  const updateNewMapping = (
    tempId: string,
    field: keyof LocalMapping,
    value: string | boolean,
  ) => {
    setNewMappings(
      newMappings.map((m) =>
        m.tempId === tempId ? { ...m, [field]: value } : m,
      ),
    );
  };

  const removeNewMapping = (tempId: string) => {
    setNewMappings(newMappings.filter((m) => m.tempId !== tempId));
  };

  const saveNewMappings = async () => {
    const validMappings = newMappings.filter(
      (m) => m.sourceFieldPath && m.targetFieldName,
    );

    if (validMappings.length === 0) return;

    setIsSaving(true);
    try {
      await onSaveMappings(
        validMappings.map((m, index) => ({
          pipelineId,
          sourceFieldPath: m.sourceFieldPath,
          targetFieldName: m.targetFieldName,
          targetCompositeSubField: m.targetCompositeSubField || null,
          transform: null,
          relationTargetObjectName: m.relationTargetObjectName || null,
          relationMatchFieldName: m.relationMatchFieldName || null,
          relationAutoCreate: m.relationAutoCreate,
          position: mappings.length + index,
        })),
      );
      setNewMappings([]);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <StyledTable>
      <StyledHeader>
        <StyledFieldCell>{t`Source Field Path`}</StyledFieldCell>
        <StyledArrow />
        <StyledFieldCell>{t`Target CRM Field`}</StyledFieldCell>
        <StyledFieldCell>{t`Sub-field`}</StyledFieldCell>
        <div style={{ width: 32 }} />
      </StyledHeader>

      {mappings.map((mapping) => (
        <StyledRow key={mapping.id}>
          <StyledFieldCell>
            <TextInput
              value={mapping.sourceFieldPath}
              onChange={(value: string) =>
                onUpdateMapping(mapping.id, { sourceFieldPath: value })
              }
              placeholder={t`e.g. data.firstName`}
              fullWidth
            />
          </StyledFieldCell>
          <StyledArrow>&rarr;</StyledArrow>
          <StyledFieldCell>
            <TextInput
              value={mapping.targetFieldName}
              onChange={(value: string) =>
                onUpdateMapping(mapping.id, { targetFieldName: value })
              }
              placeholder={t`e.g. name`}
              fullWidth
            />
          </StyledFieldCell>
          <StyledFieldCell>
            <TextInput
              value={mapping.targetCompositeSubField ?? ''}
              onChange={(value: string) =>
                onUpdateMapping(mapping.id, {
                  targetCompositeSubField: value || undefined,
                })
              }
              placeholder={t`e.g. firstName`}
              fullWidth
            />
          </StyledFieldCell>
          <StyledDeleteButton onClick={() => onDeleteMapping(mapping.id)}>
            <IconTrash size={16} />
          </StyledDeleteButton>
        </StyledRow>
      ))}

      {newMappings.map((mapping) => (
        <StyledRow key={mapping.tempId}>
          <StyledFieldCell>
            <TextInput
              value={mapping.sourceFieldPath}
              onChange={(value: string) =>
                updateNewMapping(mapping.tempId, 'sourceFieldPath', value)
              }
              placeholder={t`e.g. data.firstName`}
              fullWidth
            />
          </StyledFieldCell>
          <StyledArrow>&rarr;</StyledArrow>
          <StyledFieldCell>
            <TextInput
              value={mapping.targetFieldName}
              onChange={(value: string) =>
                updateNewMapping(mapping.tempId, 'targetFieldName', value)
              }
              placeholder={t`e.g. name`}
              fullWidth
            />
          </StyledFieldCell>
          <StyledFieldCell>
            <TextInput
              value={mapping.targetCompositeSubField}
              onChange={(value: string) =>
                updateNewMapping(
                  mapping.tempId,
                  'targetCompositeSubField',
                  value,
                )
              }
              placeholder={t`e.g. firstName`}
              fullWidth
            />
          </StyledFieldCell>
          <StyledDeleteButton onClick={() => removeNewMapping(mapping.tempId)}>
            <IconTrash size={16} />
          </StyledDeleteButton>
        </StyledRow>
      ))}

      <StyledButtonRow>
        <Button
          Icon={IconPlus}
          title={t`Add Mapping`}
          variant="secondary"
          size="small"
          onClick={addRow}
        />
        {newMappings.length > 0 && (
          <Button
            title={isSaving ? t`Saving...` : t`Save New Mappings`}
            variant="primary"
            size="small"
            onClick={saveNewMappings}
            disabled={isSaving}
          />
        )}
      </StyledButtonRow>
    </StyledTable>
  );
};
