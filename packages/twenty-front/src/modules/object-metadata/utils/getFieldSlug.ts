import toKebabCase from 'lodash.kebabcase';

import { Field } from '~/generated-metadata/graphql';

export const getFieldSlug = (metadataField: Pick<Field, 'label'>) =>
  toKebabCase(metadataField.label);
