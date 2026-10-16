import { OperationType } from '@/apollo/types/OperationType';

const operationTypeColors = {
  // oxlint-disable-next-line twenty/no-hardcoded-colors
  query: '#03A9F4',
  // oxlint-disable-next-line twenty/no-hardcoded-colors
  mutation: '#61A600',
  // oxlint-disable-next-line twenty/no-hardcoded-colors
  subscription: '#61A600',
  // oxlint-disable-next-line twenty/no-hardcoded-colors
  error: '#F51818',
  // oxlint-disable-next-line twenty/no-hardcoded-colors
  default: '#61A600',
};

const getOperationColor = (operationType: OperationType) => {
  return operationTypeColors[operationType] ?? operationTypeColors.default;
};

const formatTitle = (
  operationType: OperationType,
  schemaName: string,
  queryName: string,
  time: string | number,
) => {
  const headerCss = [
    'color: gray; font-weight: lighter', // title
    `color: ${getOperationColor(operationType)}; font-weight: bold;`, // operationType
    'color: gray; font-weight: lighter;', // schemaName
    'color: black; font-weight: bold;', // queryName
  ];

  const parts = [
    // oxlint-disable-next-line lingui/no-unlocalized-strings -- This is a browser console formatting directive or developer log label.
    '%c apollo',
    `%c${operationType}`,
    `%c${schemaName}::%c${queryName}`,
  ];

  if (operationType !== OperationType.Subscription) {
    // oxlint-disable-next-line lingui/no-unlocalized-strings -- This is a browser console formatting directive or developer log label.
    parts.push(`%c(in ${time} ms)`);
    headerCss.push('color: gray; font-weight: lighter;'); // time
  } else {
    // oxlint-disable-next-line lingui/no-unlocalized-strings -- This is a browser console formatting directive or developer log label.
    parts.push(`%c(@ ${time})`);
    headerCss.push('color: gray; font-weight: lighter;'); // time
  }

  return [parts.join(' '), ...headerCss];
};

export default formatTitle;
