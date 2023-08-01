import { useCallback, useState } from 'react';
import {
  Heading,
  Radio,
  RadioGroup,
  Stack,
  Text,
  useStyleConfig,
} from '@chakra-ui/react';
import styled from '@emotion/styled';

import { Modal } from '@/ui/modal/components/Modal';

import { ContinueButton } from '../../components/ContinueButton';
import { useRsi } from '../../hooks/useRsi';
import type { themeOverrides } from '../../theme';

const StyledContent = styled(Modal.Content)`
  align-items: center;
  justify-content: center;
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
  const { translations } = useRsi();
  const [value, setValue] = useState(sheetNames[0]);
  const styles = useStyleConfig(
    'SelectSheetStep',
  ) as (typeof themeOverrides)['components']['SelectSheetStep']['baseStyle'];
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
        <Heading {...styles.heading}>
          {translations.uploadStep.selectSheet.title}
        </Heading>
        <RadioGroup onChange={(value) => setValue(value)} value={value}>
          <Stack spacing={8}>
            {sheetNames.map((sheetName) => (
              <Radio value={sheetName} key={sheetName} {...styles.radio}>
                <Text {...styles.radioLabel}>{sheetName}</Text>
              </Radio>
            ))}
          </Stack>
        </RadioGroup>
      </StyledContent>
      <ContinueButton
        isLoading={isLoading}
        onContinue={() => handleOnContinue(value)}
        title={translations.uploadStep.selectSheet.nextButtonTitle}
      />
    </>
  );
};
