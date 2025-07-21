import {
  IconSquareNumber1,
  IconSquareNumber2,
  IconSquareNumber3,
  IconSquareNumber4,
  IconSquareNumber5,
  IconSquareNumber6,
  IconSquareNumber7,
  IconSquareNumber8,
  IconSquareNumber9,
} from 'twenty-ui/display';

export const getPositionWordLabel = (index: number): string => {
  const labels = [
    'First',
    'Second',
    'Third',
    'Fourth',
    'Fifth',
    'Sixth',
    'Seventh',
    'Eighth',
    'Ninth',
  ];
  return labels[index] || `${index + 1}th`;
};

export const getPositionNumberIcon = (index: number) => {
  const iconMapping = [
    IconSquareNumber1,
    IconSquareNumber2,
    IconSquareNumber3,
    IconSquareNumber4,
    IconSquareNumber5,
    IconSquareNumber6,
    IconSquareNumber7,
    IconSquareNumber8,
    IconSquareNumber9,
  ];

  return iconMapping[index] || IconSquareNumber1;
};
