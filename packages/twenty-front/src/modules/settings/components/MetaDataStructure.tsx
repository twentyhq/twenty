
import { tokenPairState } from '@/auth/states/tokenPairState';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import styled from '@emotion/styled';
import { useState } from 'react';
import { useRecoilState } from 'recoil';

const StyledButtonContainer = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 16px;
`;

const StyledButton = styled.button<{ variant?: 'primary' | 'secondary' }>`
  background-color: ${({ variant }) => variant === 'secondary' ? '#F5F5F5' : '#0000FF'};
  color: ${({ variant }) => variant === 'secondary' ? '#000000' : 'white'};
  padding: 8px 16px;
  border-radius: 4px;
  border: 1px solid ${({ variant }) => variant === 'secondary' ? '#E0E0E0' : '#0000FF'};
  cursor: pointer;

  &:hover {
    background-color: ${({ variant }) => variant === 'secondary' ? '#E0E0E0' : '#0000DD'};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const MetadataStructureSection = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tokenPair] = useRecoilState(tokenPairState);
  const { enqueueSnackBar } = useSnackBar();

  const handleCreateStructure = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const response = await fetch(
        `${process.env.REACT_APP_SERVER_BASE_URL}/workspace-modifications/create-metadata-structure`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${tokenPair?.accessToken?.token}`,
          },
        }
      );

      console.log("response from create metadata structure", response);
      if (!response.ok) {
        throw new Error('Failed to create metadata structure');
      }

      enqueueSnackBar('Metadata structure created successfully', {
        variant: SnackBarVariant.Success,
      });
    } catch (error) {
      enqueueSnackBar(
        error instanceof Error
          ? `Failed to create metadata structure: ${error.message}`
          : 'Failed to create metadata structure',
        {
          variant: SnackBarVariant.Error,
        }
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <StyledButtonContainer>
      <StyledButton
        onClick={handleCreateStructure}
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Creating...' : 'Create Metadata Structure'}
      </StyledButton>
    </StyledButtonContainer>
  );
};