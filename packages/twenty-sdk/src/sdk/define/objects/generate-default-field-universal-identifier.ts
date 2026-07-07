import { getFieldUniversalIdentifier } from 'twenty-shared/application';

export const generateDefaultFieldUniversalIdentifier = ({
  applicationUniversalIdentifier,
  objectUniversalIdentifier,
  fieldName,
}: {
  applicationUniversalIdentifier: string;
  objectUniversalIdentifier: string;
  fieldName: string;
}) =>
  getFieldUniversalIdentifier({
    applicationUniversalIdentifier,
    objectUniversalIdentifier,
    name: fieldName,
  });
