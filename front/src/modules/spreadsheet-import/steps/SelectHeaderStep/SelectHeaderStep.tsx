import { useCallback, useState } from 'react';
import styled from '@emotion/styled';

import { Modal } from '@/ui/modal/components/Modal';

import { ContinueButton } from '../../components/ContinueButton';
import type { RawData } from '../../types';

import { SelectHeaderTable } from './components/SelectHeaderTable';

const Title = styled.span`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.xl};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  margin-bottom: ${({ theme }) => theme.spacing(8)};
  text-align: center;
`;

const TableContainer = styled.div`
  display: flex;
  flex-grow: 1;
  height: 0px;
`;

type SelectHeaderProps = {
  data: RawData[];
  onContinue: (headerValues: RawData, data: RawData[]) => Promise<void>;
};

export const SelectHeaderStep = ({ data, onContinue }: SelectHeaderProps) => {
  const [selectedRows, setSelectedRows] = useState<ReadonlySet<number>>(
    new Set([0]),
  );
  const [isLoading, setIsLoading] = useState(false);

  const handleContinue = useCallback(async () => {
    const [selectedRowIndex] = selectedRows;
    // We consider data above header to be redundant
    const trimmedData = data.slice(selectedRowIndex + 1);
    setIsLoading(true);
    await onContinue(data[selectedRowIndex], trimmedData);
    setIsLoading(false);
  }, [onContinue, data, selectedRows]);

  return (
    <>
      <Modal.Content>
        <Title>Select header row</Title>
        <TableContainer>
          <SelectHeaderTable
            data={data}
            selectedRows={selectedRows}
            setSelectedRows={setSelectedRows}
          />
        </TableContainer>
      </Modal.Content>
      <ContinueButton
        onContinue={handleContinue}
        title="Next"
        isLoading={isLoading}
      />
    </>
  );
};
