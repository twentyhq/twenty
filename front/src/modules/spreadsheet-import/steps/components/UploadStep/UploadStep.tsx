import { useCallback, useState } from 'react';
import styled from '@emotion/styled';
import { type WorkBook } from 'xlsx-ugnis';

import { Modal } from '@/ui/modal/components/Modal';

import { DropZone } from './components/DropZone';

const StyledContent = styled(Modal.Content)`
  padding: ${({ theme }) => theme.spacing(6)};
`;

type UploadProps = {
  onContinue: (data: WorkBook, file: File) => Promise<void>;
};

export const UploadStep = ({ onContinue }: UploadProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleOnContinue = useCallback(
    async (data: WorkBook, file: File) => {
      setIsLoading(true);
      await onContinue(data, file);
      setIsLoading(false);
    },
    [onContinue],
  );

  return (
    <StyledContent>
      <DropZone onContinue={handleOnContinue} isLoading={isLoading} />
    </StyledContent>
  );
};
