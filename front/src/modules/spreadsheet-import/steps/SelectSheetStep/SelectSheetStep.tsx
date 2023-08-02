import { useCallback, useState } from 'react';
import { Radio, RadioGroup, Stack } from '@chakra-ui/react';
import styled from '@emotion/styled';

import { Modal } from '@/ui/modal/components/Modal';

import { ContinueButton } from '../../components/ContinueButton';

const Content = styled(Modal.Content)`
  background-color: red;
  flex: 0;
  height: 100%;
  overflow-y: scroll;
`;

const Title = styled.span`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.xl};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  margin-bottom: ${({ theme }) => theme.spacing(8)};
  text-align: center;
`;

const Value = styled.span`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.regular};
`;

type SelectSheetProps = {
  sheetNames: string[];
  onContinue: (sheetName: string) => Promise<void>;
};

export const SelectSheetStep = ({
  sheetNames,
  onContinue,
}: SelectSheetProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const [value, setValue] = useState(sheetNames[0]);

  const handleOnContinue = useCallback(
    async (data: typeof value) => {
      setIsLoading(true);
      await onContinue(data);
      setIsLoading(false);
    },
    [onContinue],
  );

  return (
    <>
      <Content>
        <Title>Select the sheet to use</Title>
        <RadioGroup onChange={(value) => setValue(value)} value={value}>
          <Stack spacing={8}>
            {sheetNames.map((sheetName) => (
              <Radio value={sheetName} key={sheetName}>
                <Value>{sheetName}</Value>
              </Radio>
            ))}
          </Stack>
        </RadioGroup>
      </Content>
      <ContinueButton
        isLoading={isLoading}
        onContinue={() => handleOnContinue(value)}
        title="Next"
      />
    </>
  );
};
