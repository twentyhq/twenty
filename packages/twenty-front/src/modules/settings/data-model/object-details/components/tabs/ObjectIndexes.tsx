import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { SettingsObjectIndexTable } from '~/pages/settings/data-model/SettingsObjectIndexTable';
import { H2Title } from 'twenty-ui/display';
import { Section } from 'twenty-ui/layout';

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
