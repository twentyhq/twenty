import { ModalWrapper } from '@/spreadsheet-import/components/core/ModalWrapper';
import { Providers } from '@/spreadsheet-import/components/core/Providers';
import { MatchColumnsStep } from '@/spreadsheet-import/components/steps/MatchColumnsStep/MatchColumnsStep';
import { mockRsiValues } from '@/spreadsheet-import/stories/mockRsiValues';

export default {
  title: 'Match Columns Steps',
  parameters: {
    layout: 'fullscreen',
  },
};

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

export const Basic = () => (
  <Providers rsiValues={mockRsiValues}>
    <ModalWrapper isOpen={true} onClose={() => {}}>
      <MatchColumnsStep
        headerValues={mockData[0] as string[]}
        data={mockData.slice(1)}
        onContinue={() => {}}
      />
    </ModalWrapper>
  </Providers>
);
