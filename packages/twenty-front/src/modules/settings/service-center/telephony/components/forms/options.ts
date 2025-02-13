export const typeOptions = [
  {
    label: 'PABX',
    value: '1',
  },
  {
    label: 'Posição de atendimento (PA)',
    value: '2',
  },
];

export const extensionGroupOptions = [
  {
    label: 'Choose a group',
    value: '',
  },
  {
    label: 'Grupo 1',
    value: 'Grupo 1',
  },
  {
    label: 'Grupo 2',
    value: 'Grupo 2',
  },
];

export const areaCodeOptions = [
  { label: 'Choose a code', value: '' },
  { label: '11', value: '11' },
  { label: '12', value: '12' },
  { label: '13', value: '13' },
  { label: '14', value: '14' },
  { label: '15', value: '15' },
  { label: '16', value: '16' },
  { label: '17', value: '17' },
  { label: '18', value: '18' },
  { label: '19', value: '19' },
  { label: '21', value: '21' },
  { label: '22', value: '22' },
  { label: '24', value: '24' },
  { label: '27', value: '27' },
  { label: '28', value: '28' },
  { label: '31', value: '31' },
  { label: '32', value: '32' },
  { label: '33', value: '33' },
  { label: '34', value: '34' },
  { label: '35', value: '35' },
  { label: '37', value: '37' },
  { label: '38', value: '38' },
  { label: '41', value: '41' },
  { label: '42', value: '42' },
  { label: '43', value: '43' },
  { label: '44', value: '44' },
  { label: '45', value: '45' },
  { label: '46', value: '46' },
  { label: '47', value: '47' },
  { label: '48', value: '48' },
  { label: '49', value: '49' },
  { label: '51', value: '51' },
  { label: '53', value: '53' },
  { label: '54', value: '54' },
  { label: '55', value: '55' },
  { label: '61', value: '61' },
  { label: '62', value: '62' },
  { label: '63', value: '63' },
  { label: '64', value: '64' },
  { label: '65', value: '65' },
  { label: '66', value: '66' },
  { label: '67', value: '67' },
  { label: '68', value: '68' },
  { label: '69', value: '69' },
  { label: '71', value: '71' },
  { label: '73', value: '73' },
  { label: '74', value: '74' },
  { label: '75', value: '75' },
  { label: '77', value: '77' },
  { label: '79', value: '79' },
  { label: '81', value: '81' },
  { label: '82', value: '82' },
  { label: '83', value: '83' },
  { label: '84', value: '84' },
  { label: '85', value: '85' },
  { label: '86', value: '86' },
  { label: '87', value: '87' },
  { label: '88', value: '88' },
  { label: '89', value: '89' },
  { label: '91', value: '91' },
  { label: '92', value: '92' },
  { label: '93', value: '93' },
  { label: '94', value: '94' },
  { label: '95', value: '95' },
  { label: '96', value: '96' },
  { label: '97', value: '97' },
  { label: '98', value: '98' },
  { label: '99', value: '99' },
];

export const pullCallsOptions = [
  {
    label: 'Choose an option',
    value: '',
  },
  {
    label: 'No',
    value: '0',
  },
  {
    label: 'Yes',
    value: '3',
  },
];

export const fowardAllCallsOptions = [
  {
    label: 'Choose an option',
    value: '',
  },
  {
    label: "Don't foward",
    value: '0',
  },
  {
    label: 'Foward to Extension',
    value: '1',
  },
  {
    label: 'Foward to external number',
    value: '8',
  },
  {
    label: 'Foward to mailbox',
    value: '9',
  },
  {
    label: 'Advanced',
    value: '5',
  },
];

export const dontFowardOptions = fowardAllCallsOptions.filter(
  (option) => option.value !== '0' && option.value !== '5',
);
