export const getTextDataModelSelectOptions = (t: (key: TemplateStringsArray) => string) => [
    {
    label: t`Deactivated`,
    value: 0,
    },
    {
    label: t`First 2 lines`,
    value: 2,
    },
    {
    label: t`First 5 lines`,
    value: 5,
    },
    {
    label: t`First 10 lines`,
    value: 10,
    },
    {
    label: t`All lines`,
    value: 99,
    },
];