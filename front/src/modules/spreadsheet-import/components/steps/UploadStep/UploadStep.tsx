import { useCallback, useState } from 'react';
import styled from '@emotion/styled';
import type XLSX from 'xlsx-ugnis';

import { Modal } from '@/ui/modal/components/Modal';

import { DropZone } from './components/DropZone';

const Content = styled(Modal.Content)`
  padding: ${({ theme }) => theme.spacing(6)};
`;

type UploadProps = {
  onContinue: (data: XLSX.WorkBook, file: File) => Promise<void>;
};

export const UploadStep = ({ onContinue }: UploadProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleOnContinue = useCallback(
    async (data: XLSX.WorkBook, file: File) => {
      setIsLoading(true);
      await onContinue(data, file);
      setIsLoading(false);
    },
    [onContinue],
  );

  return (
    <Content>
      <DropZone onContinue={handleOnContinue} isLoading={isLoading} />
    </Content>
  );
};
