import { type SelectOptionMeta } from 'src/types/select-option-meta';

export const SIZE_OPTIONS: readonly SelectOptionMeta[] = [
  {
    key: 'oneToTen',
    value: 'ONE_TO_TEN',
    label: '1-10',
    color: 'blue',
    position: 0,
  },
  {
    key: 'elevenToFifty',
    value: 'ELEVEN_TO_FIFTY',
    label: '11-50',
    color: 'red',
    position: 1,
  },
  {
    key: 'fiftyOneToTwoHundred',
    value: 'FIFTY_ONE_TO_TWO_HUNDRED',
    label: '51-200',
    color: 'green',
    position: 2,
  },
  {
    key: 'twoHundredOneToFiveHundred',
    value: 'TWO_HUNDRED_ONE_TO_FIVE_HUNDRED',
    label: '201-500',
    color: 'orange',
    position: 3,
  },
  {
    key: 'fiveHundredOneToOneThousand',
    value: 'FIVE_HUNDRED_ONE_TO_ONE_THOUSAND',
    label: '501-1000',
    color: 'purple',
    position: 4,
  },
  {
    key: 'oneThousandOneToFiveThousand',
    value: 'ONE_THOUSAND_ONE_TO_FIVE_THOUSAND',
    label: '1001-5000',
    color: 'yellow',
    position: 5,
  },
  {
    key: 'fiveThousandOneToTenThousand',
    value: 'FIVE_THOUSAND_ONE_TO_TEN_THOUSAND',
    label: '5001-10000',
    color: 'pink',
    position: 6,
  },
  {
    key: 'tenThousandOnePlus',
    value: 'TEN_THOUSAND_ONE_PLUS',
    label: '10001+',
    color: 'cyan',
    position: 7,
  },
];
