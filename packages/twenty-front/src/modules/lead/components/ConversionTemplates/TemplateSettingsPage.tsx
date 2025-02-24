import { useCallback, useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import styled from '@emotion/styled';

import { PageTitle } from '@/ui/layout/components/PageTitle';
import { Button } from '@/ui/button/components/Button';
import { IconPlus } from '@/ui/icon';
import { Modal } from '@/ui/modal/components/Modal';

import { TemplateList } from './TemplateList';
import { TemplateForm } from './TemplateForm';
import { GET_CONVERSION_TEMPLATES } from '../../graphql/queries';
import {
  CREATE_CONVERSION_TEMPLATE,
  UPDATE_CONVERSION_TEMPLATE,
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

const availableObjects = [
  { value: 'company', label: 'Company' },
  { value: 'person', label: 'Person' },
  { value: 'opportunity', label: 'Opportunity' },
];

export const TemplateSettingsPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<any>(null);

  const { data: templatesData, loading: templatesLoading } = useQuery(
    GET_CONVERSION_TEMPLATES,
  );

  const [createTemplate] = useMutation(CREATE_CONVERSION_TEMPLATE, {
    refetchQueries: ['GetConversionTemplates'],
  });

  const [updateTemplate] = useMutation(UPDATE_CONVERSION_TEMPLATE, {
    refetchQueries: ['GetConversionTemplates'],
  });

  const handleCreateClick = useCallback(() => {
    setEditingTemplate(null);
    setIsModalOpen(true);
  }, []);

  const handleEditTemplate = useCallback(
    (templateId: string) => {
      const template = templatesData?.conversionTemplates.find(
        (t: any) => t.id === templateId,
      );
      setEditingTemplate(template);
      setIsModalOpen(true);
    },
    [templatesData],
  );

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingTemplate(null);
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
              input: data,
            },
          });
        }
        handleCloseModal();
      } catch (error) {
        console.error('Error saving template:', error);
      }
    },
    [createTemplate, updateTemplate, editingTemplate, handleCloseModal],
  );

  if (templatesLoading) {
    return <div>Loading...</div>;
  }

  return (
    <StyledContainer>
      <StyledHeader>
        <PageTitle
          title="Lead Conversion Templates"
          description="Manage templates for converting leads to other objects"
        />
        <Button
          variant="primary"
          onClick={handleCreateClick}
          icon={<IconPlus size={16} />}
        >
          Create Template
        </Button>
      </StyledHeader>

      <TemplateList onEditTemplate={handleEditTemplate} />

      {isModalOpen && (
        <Modal
          title={editingTemplate ? 'Edit Template' : 'Create Template'}
          onClose={handleCloseModal}
          width="large"
        >
          <TemplateForm
            initialData={editingTemplate}
            availableObjects={availableObjects}
            onSubmit={handleSubmit}
            onCancel={handleCloseModal}
          />
        </Modal>
      )}
    </StyledContainer>
  );
};
