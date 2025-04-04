import { IconNumber9, IconPercentage } from 'twenty-ui/display';

export const getNumberDataModelSelectOptions = (t: (key: TemplateStringsArray) => string) => [
    {
    Icon: IconNumber9,
    label: t`Number`,
    value: 'number',
    },
    {
    Icon: IconPercentage,
    label: t`Percentage`,
    value: 'percentage',
    },
];