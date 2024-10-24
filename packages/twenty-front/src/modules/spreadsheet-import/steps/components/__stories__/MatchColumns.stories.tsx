import { Meta } from '@storybook/react';

import { mockRsiValues } from '@/spreadsheet-import/__mocks__/mockRsiValues';
import { ModalWrapper } from '@/spreadsheet-import/components/ModalWrapper';
import { ReactSpreadsheetImportContextProvider } from '@/spreadsheet-import/components/ReactSpreadsheetImportContextProvider';
import { MatchColumnsStep } from '@/spreadsheet-import/steps/components/MatchColumnsStep/MatchColumnsStep';
import { SpreadsheetImportStep } from '@/spreadsheet-import/steps/types/SpreadsheetImportStep';
import { DialogManagerScope } from '@/ui/feedback/dialog-manager/scopes/DialogManagerScope';
import { SnackBarDecorator } from '~/testing/decorators/SnackBarDecorator';

const meta: Meta<typeof MatchColumnsStep> = {
  title: 'Modules/SpreadsheetImport/MatchColumnsStep',
  component: MatchColumnsStep,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [SnackBarDecorator],
};

export default meta;

const mockData = [
  ['id', 'first_name', 'last_name', 'email', 'gender', 'ip_address'],
  ['2', 'Geno', 'Gencke', 'ggencke0@tinypic.com', 'Female', '17.204.180.40'],
  [
    '3',
    'Bertram',
    'Twyford',
    'btwyford1@seattletimes.com',
    'Genderqueer',
    '188.98.2.13',
  ],
  [
    '4',
    'Tersina',
    'Isacke',
    'tisacke2@edublogs.org',
    'Non-binary',
    '237.69.180.31',
  ],
  [
    '5',
    'Yoko',
    'Guilliland',
    'yguilliland3@elegantthemes.com',
    'Male',
    '179.123.237.119',
  ],
  ['6', 'Freida', 'Fearns', 'ffearns4@fotki.com', 'Male', '184.48.15.1'],
  ['7', 'Mildrid', 'Mount', 'mmount5@last.fm', 'Male', '26.97.160.103'],
  [
    '8',
    'Jolene',
    'Darlington',
    'jdarlington6@jalbum.net',
    'Agender',
    '172.14.232.84',
  ],
  ['9', 'Craig', 'Dickie', 'cdickie7@virginia.edu', 'Male', '143.248.220.47'],
  ['10', 'Jere', 'Shier', 'jshier8@comcast.net', 'Agender', '10.143.62.161'],
];

export const Default = () => (
  <DialogManagerScope dialogManagerScopeId="dialog-manager">
    <ReactSpreadsheetImportContextProvider values={mockRsiValues}>
      <ModalWrapper isOpen={true} onClose={() => null}>
        <MatchColumnsStep
          headerValues={mockData[0] as string[]}
          data={mockData.slice(1)}
          onBack={() => null}
          setCurrentStepState={() => null}
          setPreviousStepState={() => null}
          currentStepState={{} as SpreadsheetImportStep}
          nextStep={() => null}
          onError={() => null}
        />
      </ModalWrapper>
    </ReactSpreadsheetImportContextProvider>
  </DialogManagerScope>
);
