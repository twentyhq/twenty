import { useState } from 'react';
import { Box, Button, Code, Link, useDisclosure } from '@chakra-ui/react';

import { ReactSpreadsheetImport } from '../ReactSpreadsheetImport';
import { Result } from '../types';

import { mockRsiValues } from './mockRsiValues';

export default {
  title: 'React spreadsheet import',
};

export const Basic = () => {
  const [data, setData] = useState<Result<any> | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  return (
    <>
      <Box py={20} display="flex" gap="8px" alignItems="center">
        <Button
          onClick={onOpen}
          border="2px solid #7069FA"
          p="8px"
          borderRadius="8px"
        >
          Open Flow
        </Button>
        (make sure you have a file to upload)
      </Box>
      <Link
        href="./exampleFile.csv"
        border="2px solid #718096"
        p="8px"
        borderRadius="8px"
        download="exampleCSV"
      >
        Download example file
      </Link>
      <ReactSpreadsheetImport
        {...mockRsiValues}
        isOpen={isOpen}
        onClose={onClose}
        onSubmit={setData}
      />
      {!!data && (
        <Box pt={64} display="flex" gap="8px" flexDirection="column">
          <b>Returned data (showing first 100 rows):</b>
          <Code
            display="flex"
            alignItems="center"
            borderRadius="16px"
            fontSize="12px"
            background="#4A5568"
            color="white"
            p={32}
          >
            <pre>
              {JSON.stringify(
                {
                  validData: data.validData.slice(0, 100),
                  invalidData: data.invalidData.slice(0, 100),
                  all: data.all.slice(0, 100),
                },
                undefined,
                4,
              )}
            </pre>
          </Code>
        </Box>
      )}
    </>
  );
};
