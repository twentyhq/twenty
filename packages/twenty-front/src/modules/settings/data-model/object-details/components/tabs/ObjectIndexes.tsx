import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { t } from '@lingui/core/macro';
import { H2Title } from 'twenty-ui/display';
import { Section } from 'twenty-ui/layout';
import { SettingsObjectIndexTable } from '~/pages/settings/data-model/SettingsObjectIndexTable';

type ObjectIndexesProps = {
  objectMetadataItem: EnrichedObjectMetadataItem;
};

export const ObjectIndexes = ({ objectMetadataItem }: ObjectIndexesProps) => {
  return (
    <Section>
      <H2Title
        title={t`Indexes`}
        description={t`Advanced feature to improve the performance of queries and to enforce unicity constraints.`}
      />
      <SettingsObjectIndexTable objectMetadataItem={objectMetadataItem} />
    </Section>
  );
};
