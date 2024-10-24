import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';

import { Section } from '@/ui/layout/section/components/Section';
import styled from '@emotion/styled';
import { H2Title } from 'twenty-ui';
import { SettingsObjectIndexTable } from '~/pages/settings/data-model/SettingsObjectIndexTable';

type ObjectIndexesProps = {
  objectMetadataItem: ObjectMetadataItem;
};

const StyledContentContainer = styled.div`
  padding-left: ${({ theme }) => theme.spacing(8)};
`;

export const ObjectIndexes = ({ objectMetadataItem }: ObjectIndexesProps) => {
  return (
    <StyledContentContainer>
      <Section>
        <H2Title
          title="Indexes"
          description={`Advanced feature to improve the performance of queries and to enforce unicity constraints.`}
        />
        <SettingsObjectIndexTable objectMetadataItem={objectMetadataItem} />
      </Section>
    </StyledContentContainer>
  );
};
