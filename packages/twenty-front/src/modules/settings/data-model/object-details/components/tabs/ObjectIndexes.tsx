import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';

import { H2Title, Section } from 'twenty-ui';
import { SettingsObjectIndexTable } from '~/pages/settings/data-model/SettingsObjectIndexTable';

type ObjectIndexesProps = {
  objectMetadataItem: ObjectMetadataItem;
};

export const ObjectIndexes = ({ objectMetadataItem }: ObjectIndexesProps) => {
  return (
    <Section>
      <H2Title
        title="Indexes"
        description={`Advanced feature to improve the performance of queries and to enforce unicity constraints.`}
      />
      <SettingsObjectIndexTable objectMetadataItem={objectMetadataItem} />
    </Section>
  );
};
