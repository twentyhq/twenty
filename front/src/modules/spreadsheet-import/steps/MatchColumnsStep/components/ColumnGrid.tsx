import type React from 'react';
import { Box, Flex, Heading, Text, useStyleConfig } from '@chakra-ui/react';

import { Modal } from '@/ui/modal/components/Modal';

import { ContinueButton } from '../../../components/ContinueButton';
import { FadingWrapper } from '../../../components/FadingWrapper';
import { useRsi } from '../../../hooks/useRsi';
import type { themeOverrides } from '../../../theme';
import type { Column, Columns } from '../MatchColumnsStep';

type ColumnGridProps<T extends string> = {
  columns: Columns<T>;
  userColumn: (column: Column<T>) => React.ReactNode;
  templateColumn: (column: Column<T>) => React.ReactNode;
  onContinue: (val: Record<string, string>[]) => void;
  isLoading: boolean;
};

export type Styles =
  (typeof themeOverrides)['components']['MatchColumnsStep']['baseStyle'];

export const ColumnGrid = <T extends string>({
  columns,
  userColumn,
  templateColumn,
  onContinue,
  isLoading,
}: ColumnGridProps<T>) => {
  const { translations } = useRsi();
  const styles = useStyleConfig('MatchColumnsStep') as Styles;

  return (
    <>
      <Modal.Content>
        <Heading sx={styles.heading}>
          {translations.matchColumnsStep.title}
        </Heading>
        <Flex
          flex={1}
          display="grid"
          gridTemplateRows="auto auto auto 1fr"
          gridTemplateColumns={`0.75rem repeat(${columns.length}, minmax(18rem, auto)) 0.75rem`}
        >
          <Box gridColumn={`1/${columns.length + 3}`}>
            <Text sx={styles.title}>
              {translations.matchColumnsStep.userTableTitle}
            </Text>
          </Box>
          {columns.map((column, index) => (
            <Box
              gridRow="2/3"
              gridColumn={`${index + 2}/${index + 3}`}
              pt={3}
              key={column.header + index}
            >
              {userColumn(column)}
            </Box>
          ))}
          <FadingWrapper gridColumn={`1/${columns.length + 3}`} gridRow="2/3" />
          <Box gridColumn={`1/${columns.length + 3}`} mt={7}>
            <Text sx={styles.title}>
              {translations.matchColumnsStep.templateTitle}
            </Text>
          </Box>
          <FadingWrapper gridColumn={`1/${columns.length + 3}`} gridRow="4/5" />
          {columns.map((column, index) => (
            <Box
              gridRow="4/5"
              gridColumn={`${index + 2}/${index + 3}`}
              key={column.header + index}
              py="1.125rem"
              pl={2}
              pr={3}
            >
              {templateColumn(column)}
            </Box>
          ))}
        </Flex>
      </Modal.Content>
      <ContinueButton
        isLoading={isLoading}
        onContinue={onContinue}
        title={translations.matchColumnsStep.nextButtonTitle}
      />
    </>
  );
};
