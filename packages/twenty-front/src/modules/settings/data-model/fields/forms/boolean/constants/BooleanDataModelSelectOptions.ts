import { IconCheck, IconX } from 'twenty-ui/display';

export const getBooleanDataModelSelectOptions = (t: (key: TemplateStringsArray) => string) => [
    {
    value: true,
    label: t`True`,
    Icon: IconCheck,
    },
    {
    value: false,
    label: t`False`,
    Icon: IconX,
    },
];
