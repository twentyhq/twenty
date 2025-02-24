import { useCallback, useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import styled from '@emotion/styled';

import { Button } from '@/ui/button/components/Button';
import { IconArrowRight } from '@/ui/icon';
import { Modal } from '@/ui/modal/components/Modal';
import { Select } from '@/ui/input/components/Select';
import { useSnackBar } from '@/ui/feedback/snack-bar/hooks/useSnackBar';

import { GET_AVAILABLE_TEMPLATES_FOR_LEAD } from '../../graphql/queries';
import { CONVERT_LEAD } from '../../graphql/mutations';

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

interface LeadConversionButtonProps {
  leadId: string;
  onConversionSuccess?: (convertedObjectId: string, convertedObjectType: string) => void;
}

export const LeadConversionButton = ({
  leadId,
  onConversionSuccess,
}: LeadConversionButtonProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);

  const { enqueueSnackBar } = useSnackBar();

  const { data: templatesData, loading: templatesLoading } = useQuery(
    GET_AVAILABLE_TEMPLATES_FOR_LEAD,
    {
      variables: { leadId },
    },
  );

  const [convertLead, { loading: converting }] = useMutation(CONVERT_LEAD, {
    onCompleted: (data) => {
      if (data.convertLead.success) {
        enqueueSnackBar('Lead converted successfully', {
          variant: 'success',
        });
        onConversionSuccess?.(
          data.convertLead.convertedObjectId,
          data.convertLead.convertedObjectType,
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

    convertLead({
      variables: {
        leadId,
        templateId: selectedTemplateId,
      },
    });
  }, [convertLead, leadId, selectedTemplateId]);

  const selectedTemplate = selectedTemplateId
    ? templatesData?.availableTemplatesForLead.find(
        (t: any) => t.id === selectedTemplateId,
      )
    : null;

  const templateOptions = templatesData?.availableTemplatesForLead.map(
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
          title="Convert Lead"
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
              Select a template to convert this lead into another object type.
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
