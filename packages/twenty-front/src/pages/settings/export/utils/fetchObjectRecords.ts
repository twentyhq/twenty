import { SETTINGS_COMPOSITE_FIELD_TYPE_CONFIGS } from '@/settings/data-model/constants/SettingsCompositeFieldTypeConfigs';
import gql from 'graphql-tag';
import { CompositeField } from '~/pages/settings/export/types/compositeField';


export const fetchObjectRecords = async (
  objectName: string,
  objectMetadataItem: any,
  apolloClient: any,
): Promise<any[]> => {
  const singularName = objectName.replace(/s$/, '');
  const pluralName = objectName.toLowerCase();
  const fields: { name: string; type: string }[] = Array.isArray(
    objectMetadataItem?.fields,
  )
    ? objectMetadataItem.fields.map((f: any) => ({
        name: f.name,
        type: f.type,
      }))
    : [];

  const simpleFields: string[] = [];
  const compositeFields: CompositeField[] = [];

  for (const { name, type } of fields) {
    const compositeConfig =
      SETTINGS_COMPOSITE_FIELD_TYPE_CONFIGS[
        type as keyof typeof SETTINGS_COMPOSITE_FIELD_TYPE_CONFIGS
      ];
    if (compositeConfig !== undefined) {
      compositeFields.push({ name, subFields: compositeConfig.subFields });
    } else if (!['RELATION', 'MULTI_SELECT', 'SELECT'].includes(type)) {
      simpleFields.push(name);
    }
  }

  const fieldsQuery = [
    'id',
    'createdAt',
    'updatedAt',
    ...simpleFields,
    ...compositeFields.map(
      ({ name, subFields }) =>
        `${name} {\n${subFields.map((sf) => `  ${sf}`).join('\n')}\n}`,
    ),
  ]
    .map((f) => `  ${f}`)
    .join('\n');

  const graphqlQuery = gql`
    query Find${singularName}s($first: Int) {
      ${pluralName}(first: $first) {
        edges { node {\n${fieldsQuery}\n} }
      }
    }
  `;

  try {
    const { data } = await apolloClient.query({
      query: graphqlQuery,
      variables: { first: 1000 },
      errorPolicy: 'all',
      fetchPolicy: 'no-cache',
    });
    return data?.[pluralName]?.edges?.map((edge: any) => edge.node) || [];
  } catch (error) {
    return [];
  }
};
