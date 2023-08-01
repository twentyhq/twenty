import { useCallback, useState } from 'react';
import { Box, Heading, Text, useStyleConfig } from '@chakra-ui/react';
import type XLSX from 'xlsx-ugnis';

import { Modal } from '@/ui/modal/components/Modal';

import { useRsi } from '../../hooks/useRsi';
import type { themeOverrides } from '../../theme';

import { DropZone } from './components/DropZone';
import { ExampleTable } from './components/ExampleTable';
import { FadingOverlay } from './components/FadingOverlay';

type UploadProps = {
  onContinue: (data: XLSX.WorkBook, file: File) => Promise<void>;
};

export const UploadStep = ({ onContinue }: UploadProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const styles = useStyleConfig(
    'UploadStep',
  ) as (typeof themeOverrides)['components']['UploadStep']['baseStyle'];
  const { translations, fields } = useRsi();
  const handleOnContinue = useCallback(
    async (data: XLSX.WorkBook, file: File) => {
      setIsLoading(true);
      await onContinue(data, file);
      setIsLoading(false);
    },
    [onContinue],
  );
  return (
    <Modal.Content>
      <Heading sx={styles.heading}>{translations.uploadStep.title}</Heading>
      <Text sx={styles.title}>{translations.uploadStep.manifestTitle}</Text>
      <Text sx={styles.subtitle}>
        {translations.uploadStep.manifestDescription}
      </Text>
      <Box sx={styles.tableWrapper}>
        <ExampleTable fields={fields} />
        <FadingOverlay />
      </Box>
      <DropZone onContinue={handleOnContinue} isLoading={isLoading} />
    </Modal.Content>
  );
};
