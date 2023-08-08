import { useCallback, useState } from 'react';
import styled from '@emotion/styled';

import { Radio } from '@/ui/input/radio/components/Radio';
import { RadioGroup } from '@/ui/input/radio/components/RadioGroup';
import { Modal } from '@/ui/modal/components/Modal';

import { ContinueButton } from '../../components/ContinueButton';

const Content = styled(Modal.Content)`
  align-items: center;
`;

const Title = styled.span`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.xl};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  margin-bottom: ${({ theme }) => theme.spacing(8)};
  text-align: center;
`;

const RadioContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  height: 0px;
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
        <RadioContainer>
          <RadioGroup onValueChange={(value) => setValue(value)} value={value}>
            {sheetNames.map((sheetName) => (
              <Radio value={sheetName} key={sheetName} />
            ))}
          </RadioGroup>
        </RadioContainer>
      </Content>
      <ContinueButton
        isLoading={isLoading}
        onContinue={() => handleOnContinue(value)}
        title="Next"
      />
    </>
  );
};
