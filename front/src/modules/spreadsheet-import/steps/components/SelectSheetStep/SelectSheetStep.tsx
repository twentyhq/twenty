import { useCallback, useState } from 'react';
import styled from '@emotion/styled';

import { ContinueButton } from '@/spreadsheet-import/components/ContinueButton';
import { Heading } from '@/spreadsheet-import/components/Heading';
import { Radio } from '@/ui/input/radio/components/Radio';
import { RadioGroup } from '@/ui/input/radio/components/RadioGroup';
import { Modal } from '@/ui/modal/components/Modal';

const StyledContent = styled(Modal.Content)`
  align-items: center;
  padding-left: ${({ theme }) => theme.spacing(6)};
  padding-right: ${({ theme }) => theme.spacing(6)};
`;

const StyledHeading = styled(Heading)`
  margin-bottom: ${({ theme }) => theme.spacing(8)};
`;

const StyledRadioContainer = styled.div`
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
      <StyledContent>
        <StyledHeading title="Select the sheet to use" />
        <StyledRadioContainer>
          <RadioGroup onValueChange={(value) => setValue(value)} value={value}>
            {sheetNames.map((sheetName) => (
              <Radio value={sheetName} key={sheetName} />
            ))}
          </RadioGroup>
        </StyledRadioContainer>
      </StyledContent>
      <ContinueButton
        isLoading={isLoading}
        onContinue={() => handleOnContinue(value)}
        title="Next"
      />
    </>
  );
};
