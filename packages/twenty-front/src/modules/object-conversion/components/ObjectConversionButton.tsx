import { useCallback, useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import styled from '@emotion/styled';

import { Button } from '@/ui/button/components/Button';
import { IconArrowRight } from '@/ui/icon';
import { Modal } from '@/ui/modal/components/Modal';
import { Select } from '@/ui/input/components/Select';
import { useSnackBar } from '@/ui/feedback/snack-bar/hooks/useSnackBar';

import { GET_AVAILABLE_TEMPLATES_FOR_OBJECT } from '../graphql/queries';
import { CONVERT_OBJECT } from '../graphql/mutations';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};
  padding: ${({ theme }) => theme.spacing(2)};
`;

const StyledDescription = styled.div`
  color: ${({ theme }) => theme.font.color.secondary};
  font-size: ${({ theme }) => theme.font.size.sm};
`;

const StyledTemplateInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1)};
  padding: ${({ theme }) => theme.spacing(2)};
  background: ${({ theme }) => theme.background.secondary};
  border-radius: ${({ theme }) => theme.border.radius.sm};
`;

const StyledTemplateTitle = styled.div`
  font-weight: ${({ theme }) => theme.font.weight.medium};
`;

const StyledTemplateDescription = styled.div`
  color: ${({ theme }) => theme.font.color.light};
  font-size: ${({ theme }) => theme.font.size.sm};
`;

interface ObjectConversionButtonProps {
  objectId: string;
  recordId: string;
  onConversionSuccess?: (convertedObjectId: string, convertedObjectType: string) => void;
}

export const ObjectConversionButton = ({
  objectId,
  recordId,
  onConversionSuccess,
}: ObjectConversionButtonProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);

  const { enqueueSnackBar } = useSnackBar();

  const { data: templatesData, loading: templatesLoading } = useQuery(
    GET_AVAILABLE_TEMPLATES_FOR_OBJECT,
    {
      variables: { objectId, recordId },
    },
  );

  const [convertObject, { loading: converting }] = useMutation(CONVERT_OBJECT, {
    onCompleted: (data) => {
      if (data.convertObject.success) {
        enqueueSnackBar('Object converted successfully', {
          variant: 'success',
        });
        onConversionSuccess?.(
          data.convertObject.convertedObjectId,
          data.convertObject.convertedObjectType,
        );
      }
      handleCloseModal();
    },
    onError: (error) => {
      enqueueSnackBar(error.message, { variant: 'error' });
    },
  });

  const handleOpenModal = useCallback(() => {
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedTemplateId(null);
  }, []);

  const handleTemplateSelect = useCallback((templateId: string) => {
    setSelectedTemplateId(templateId);
  }, []);

  const handleConvert = useCallback(() => {
    if (!selectedTemplateId) return;

    convertObject({
      variables: {
        objectId,
        recordId,
        templateId: selectedTemplateId,
      },
    });
  }, [convertObject, objectId, recordId, selectedTemplateId]);

  const selectedTemplate = selectedTemplateId
    ? templatesData?.availableTemplatesForObject.find(
        (t: any) => t.id === selectedTemplateId,
      )
    : null;

  const templateOptions = templatesData?.availableTemplatesForObject.map(
    (template: any) => ({
      value: template.id,
      label: template.name,
    }),
  );

  return (
    <>
      <Button
        variant="secondary"
        onClick={handleOpenModal}
        icon={<IconArrowRight />}
      >
        Convert
      </Button>

      {isModalOpen && (
        <Modal
          title="Convert Object"
          onClose={handleCloseModal}
          width="medium"
          actions={[
            {
              id: 'convert',
              label: 'Convert',
              variant: 'primary',
              disabled: !selectedTemplateId || converting,
              onClick: handleConvert,
              loading: converting,
            },
            {
              id: 'cancel',
              label: 'Cancel',
              variant: 'secondary',
              onClick: handleCloseModal,
            },
          ]}
        >
          <StyledContainer>
            <StyledDescription>
              Select a template to convert this object into another type.
            </StyledDescription>

            <Select
              label="Conversion Template"
              value={selectedTemplateId || ''}
              onChange={handleTemplateSelect}
              options={templateOptions || []}
              placeholder="Select a template"
              disabled={templatesLoading}
              fullWidth
            />

            {selectedTemplate && (
              <StyledTemplateInfo>
                <StyledTemplateTitle>
                  Convert to {selectedTemplate.targetObjectType}
                </StyledTemplateTitle>
                <StyledTemplateDescription>
                  {selectedTemplate.description || 'No description available'}
                </StyledTemplateDescription>
              </StyledTemplateInfo>
            )}
          </StyledContainer>
        </Modal>
      )}
    </>
  );
};
