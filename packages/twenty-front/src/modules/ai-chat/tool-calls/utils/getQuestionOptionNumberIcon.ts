import {
  type IconComponent,
  IconSquareNumber1,
  IconSquareNumber2,
  IconSquareNumber3,
  IconSquareNumber4,
  IconSquareNumber5,
  IconSquareNumber6,
  IconSquareNumber7,
  IconSquareNumber8,
  IconSquareNumber9,
} from 'twenty-ui/icon';

const QUESTION_OPTION_NUMBER_ICONS: IconComponent[] = [
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

export const getQuestionOptionNumberIcon = (optionIndex: number) =>
  QUESTION_OPTION_NUMBER_ICONS[
    Math.min(optionIndex, QUESTION_OPTION_NUMBER_ICONS.length - 1)
  ];
