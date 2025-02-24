import { useCallback, useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import styled from '@emotion/styled';

import { PageTitle } from '@/ui/layout/components/PageTitle';
import { Button } from '@/ui/button/components/Button';
import { IconPlus } from '@/ui/icon';
import { Modal } from '@/ui/modal/components/Modal';
import { useSnackBar } from '@/ui/feedback/snack-bar/hooks/useSnackBar';

import { TemplateList } from './TemplateList';
import { TemplateForm } from './TemplateForm';
import { useAvailableObjects, useObjectFields } from '../../hooks';
import {
  GET_CONVERSION_TEMPLATES,
  GET_OBJECT_CONVERSION_SETTINGS,
} from '../../graphql/queries';
import {
  CREATE_CONVERSION_TEMPLATE,
  UPDATE_CONVERSION_TEMPLATE,
  UPDATE_OBJECT_CONVERSION_SETTINGS,
} from '../../graphql/mutations';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};
  padding: ${({ theme }) => theme.spacing(4)};
`;

const StyledHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const StyledSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
`;

interface ConversionSettingsPageProps {
  objectMetadataId: string;
}

export const ConversionSettingsPage = ({
  objectMetadataId,
}: ConversionSettingsPageProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<any>(null);
  const [selectedTargetObjectId, setSelectedTargetObjectId] = useState<string | null>(null);

  const { enqueueSnackBar } = useSnackBar();

  const { data: settingsData } = useQuery(GET_OBJECT_CONVERSION_SETTINGS, {
    variables: { objectMetadataId },
  });

  const { data: templatesData, loading: templatesLoading } = useQuery(
    GET_CONVERSION_TEMPLATES,
  );

  const { objectOptions, loading: objectsLoading } = useAvailableObjects();

  const { fieldOptions: sourceFields, loading: sourceFieldsLoading } = useObjectFields(
    objectMetadataId,
  );

  const { fieldOptions: targetFields, loading: targetFieldsLoading } = useObjectFields(
    selectedTargetObjectId || undefined,
  );

  const [updateSettings] = useMutation(UPDATE_OBJECT_CONVERSION_SETTINGS, {
    onCompleted: () => {
      enqueueSnackBar('Settings updated successfully', { variant: 'success' });
    },
    onError: (error) => {
      enqueueSnackBar(error.message, { variant: 'error' });
    },
  });

  const [createTemplate] = useMutation(CREATE_CONVERSION_TEMPLATE, {
    refetchQueries: ['GetConversionTemplates'],
    onCompleted: () => {
      enqueueSnackBar('Template created successfully', { variant: 'success' });
      handleCloseModal();
    },
    onError: (error) => {
      enqueueSnackBar(error.message, { variant: 'error' });
    },
  });

  const [updateTemplate] = useMutation(UPDATE_CONVERSION_TEMPLATE, {
    refetchQueries: ['GetConversionTemplates'],
    onCompleted: () => {
      enqueueSnackBar('Template updated successfully', { variant: 'success' });
      handleCloseModal();
    },
    onError: (error) => {
      enqueueSnackBar(error.message, { variant: 'error' });
    },
  });

  const handleCreateClick = useCallback(() => {
    setEditingTemplate(null);
    setSelectedTargetObjectId(null);
    setIsModalOpen(true);
  }, []);

  const handleEditTemplate = useCallback((templateId: string) => {
    const template = templatesData?.conversionTemplates.find(
      (t: any) => t.id === templateId,
    );
    setEditingTemplate(template);
    setSelectedTargetObjectId(template.targetObjectMetadataId);
    setIsModalOpen(true);
  }, [templatesData]);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingTemplate(null);
    setSelectedTargetObjectId(null);
  }, []);

  const handleSubmit = useCallback(
    async (data: any) => {
      try {
        if (editingTemplate) {
          await updateTemplate({
            variables: {
              input: {
                id: editingTemplate.id,
                ...data,
              },
            },
          });
        } else {
          await createTemplate({
            variables: {
              input: {
                ...data,
                sourceObjectMetadataId: objectMetadataId,
              },
            },
          });
        }
      } catch (error) {
        console.error('Error saving template:', error);
      }
    },
    [createTemplate, updateTemplate, editingTemplate, objectMetadataId],
  );

  const handleToggleSettings = useCallback(
    (field: 'isConversionSource' | 'showConvertButton', value: boolean) => {
      updateSettings({
        variables: {
          objectMetadataId,
          [field]: value,
        },
      });
    },
    [updateSettings, objectMetadataId],
  );

  const handleTargetObjectChange = useCallback((objectId: string) => {
    setSelectedTargetObjectId(objectId);
  }, []);

  if (templatesLoading || objectsLoading) {
    return <div>Loading...</div>;
  }

  return (
    <StyledContainer>
      <StyledHeader>
        <PageTitle
          title="Object Conversion Settings"
          description="Configure how this object can be converted to other types"
        />
      </StyledHeader>

      <StyledSection>
        <Button
          variant="primary"
          onClick={handleCreateClick}
          icon={<IconPlus size={16} />}
        >
          Create Template
        </Button>
      </StyledSection>

      <StyledSection>
        <TemplateList onEditTemplate={handleEditTemplate} />
      </StyledSection>

      {isModalOpen && (
        <Modal
          title={editingTemplate ? 'Edit Template' : 'Create Template'}
          onClose={handleCloseModal}
          width="large"
        >
          <TemplateForm
            initialData={editingTemplate}
            availableObjects={objectOptions}
            sourceFields={sourceFields}
            targetFields={targetFields}
            onSubmit={handleSubmit}
            onCancel={handleCloseModal}
            onTargetObjectChange={handleTargetObjectChange}
          />
        </Modal>
      )}
    </StyledContainer>
  );
};
