import { OperationType } from '../types/operation-type';

const operationTypeColors = {
  // eslint-disable-next-line @nx/workspace-no-hardcoded-colors
  query: '#03A9F4',
  // eslint-disable-next-line @nx/workspace-no-hardcoded-colors
  mutation: '#61A600',
  // eslint-disable-next-line @nx/workspace-no-hardcoded-colors
  subscription: '#61A600',
  // eslint-disable-next-line @nx/workspace-no-hardcoded-colors
  error: '#F51818',
  // eslint-disable-next-line @nx/workspace-no-hardcoded-colors
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
    '%c apollo',
    `%c${operationType}`,
    `%c${schemaName}::%c${queryName}`,
  ];

  if (operationType !== OperationType.Subscription) {
    parts.push(`%c(in ${time} ms)`);
    headerCss.push('color: gray; font-weight: lighter;'); // time
  } else {
    parts.push(`%c(@ ${time})`);
    headerCss.push('color: gray; font-weight: lighter;'); // time
  }

  return [parts.join(' '), ...headerCss];
};

export default formatTitle;
